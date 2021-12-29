const orderModel = require('../models/orderModel');
const userModel = require('../models/userModel');
const productModel = require('../models/productModel');
const cartModel = require('../models/cartModel')

const { validator, jwt } = require('../utils')


const createOrder = async function (req, res) {
  try {
    const userId = req.params.userId;
    const requestBody = req.body;

    const userIdFromToken = req.userId
    //   validation
    if (!validator.isValidRequestBody(requestBody)) {
      return res.status(400).send({ status: false, meassage: "inavlid request Parameters, Please Provide Order Deatils" })
    }
    if (!validator.isValidObjectId(userId)) {
      return res.status(400).send({ status: false, meassage: `${userId} is inavlid userId` })
    }
    const user = await userModel.findById(userId)
    if (!user) {
      return res.status(400).send({ status: false, meassage: `${userId} is deleted or not Exist` })
    }

    //    if(userId.toString()!==userIdFromToken)
    //    {
    //     return res.status(401).send({status: false, message: `Unauthorized access! Owner info doesn't match`});
    //     }

    // Extract params

    let { items, totalPrice, totalItems, totalQuantity, cancellable, status, deletedAt, isDeleted } = requestBody;

    //we will send userID recived by req.query 
    if (!validator.isValidArray(items)) {
      return res.status(400).send({ status: false, message: `Provide valid items as Array` });
    }

    const cardDetails = await cartModel.findOne({ userId: userId })
    console.log("card---Details", cardDetails)
    if (!cardDetails) {
      return res.status(400).send({ status: false, message: `cart not present` });
    }

    const product = await productModel.findOne({ _id: items[0].productId, isDeleted: false })
    console.log("producttt", product)




    // calculate total Items
    const totalItems1 = items.length
    // calculate total Price
    const totalprice1 = items.map((element, i) => {
      return product.price * items[i].quantity
    });
    let total = 0;
    for (var i in totalprice1) {
      total += totalprice1[i];
    }
    console.log(totalprice1)//[ 7000, 28000, 28000, 28000 ]
    console.log(total)//91000

    // calculate total Quntity
    var totalquantity1 = 0;
    for (var i in items) {
      totalquantity1 += items[i].quantity   //quantity = items[1].quantity + items[0].quantity
    }
     console.log(totalquantity1)


    //  const orderDetails ={
    //      userId:userId,
    //      items:items,
    //      totalprice:total,
    //      totalItems:totalItems1,
    //      totalQuantity:totalquantity1
    //    }
    //  const newOrder = await orderModel.create(orderDetails);
    //return res.status(201).send({ status: true, message: `Order created successfully`, data: newOrder })





    // const order = {
    //   userId: userId,
    //   items: items,
    //   totalprice: total,
    //   totalItems: totalItems1,
    //   // totalQuantity:totalquantity1
    // }
 //------------------------------------      WAY 1    -------------------------------------------------------------------
    //finding  array of duplicate productId---------------------------------ref(https://stackoverflow.com/questions/53212020/get-list-of-duplicate-objects-in-an-array-of-objects/53212154)

    //   const  duplicateIds = items
    //  .map(e => e['productId'])
    //  .map((e, i, final) => final.indexOf(e) !== i && i)
    //  .filter(obj=> items[obj])
    //  .map(e => items[e]["productId"])

    //  console.log("duplicated id ",duplicateIds)

    // //finding duplicate list of objects
    //  const    duplicate = items.filter(obj=> duplicateIds.includes(obj.productId));
    //  console.log("duplicated objects ",duplicate)
    //  duplicated objects  [
    //   { productId: '61c961737bbe84b7eb702ecf', quantity: 1 },
    //   { productId: '61c961737bbe84b7eb702ecf', quantity: 4 },
    //   { productId: '61c961737bbe84b7eb702ecf', quantity: 4 }
    // ]
    // var sumquantity = 0;
    // for (var i in duplicate) {
    //   sumquantity += duplicate[i].quantity   //sumquantity = items[1].quantity + items[0].quantity
    //  }console.log("sum",sumquantity)//sum 9

    //-------------------------------------------      WAY 2   ------------------------------------------------------------------
     //sum of key in array of objects javascript--------------ref(https://stackoverflow.com/questions/24444738/sum-similar-keys-in-an-array-of-objects)

    var result = items.reduce(function (acc, val) {
      var o = acc.filter(function (obj) {
        return obj.productId == val.productId;
      }).pop() || { productId: val.productId, quantity: 0 };

      o.quantity += val.quantity;
      acc.push(o);
      return acc;
    }, []);
    
   console.log(result);
  //[
  //   { productId: '61c961737bbe84b7eb702ecf', quantity: 9 },
  //   { productId: '61c961737bbe84b7eb702ecf', quantity: 9 },
  //   { productId: '61c961737bbe84b7eb702ecf', quantity: 9 }
  // ]

    var finalresult = result.filter(function (itm, i, a) {
      return i == a.indexOf(itm);
    });
    console.log(finalresult); //[ { productId: '61c961737bbe84b7eb702ecf', quantity: 9 } ]
    console.log("totalQuantity",finalresult[0].quantity)//9
    const order = {
      userId: userId,
      items: finalresult,
      totalPrice: total,
      totalItems: totalItems1,
      totalQuantity:totalquantity1
    }  
    console.log(order)
    console.log(totalPrice)

    //const response = await cartModel.findOneAndUpdate({ userId: userId }, order, { new: true })
    const newOrder = await orderModel.create(order);

    return res.status(201).send({ status: true, message: `product added in the cart successfully`, data: newOrder })

  } catch (e) {
    return res.status(500).send({ status: false, msg: e.message })
  }
}

module.exports = {
  createOrder
}
