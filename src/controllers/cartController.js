const cartModel = require('../models/cartModel');
const userModel = require('../models/userModel');
const productModel = require('../models/productModel');
const {validator,jwt}=require('../utils');


//-----------------------add cart if not exist else add prouct------------------------------------------

const addToCart = async function (req,res) {
    try{
    //     const requestBody=req.body
    //     let {items,totalPrice,totalItems}=requestBody
    //     const userId=req.params.userId
    //    // console.log(userId)
    //     if(!validator.isValidObjectId(userId)){
    //       res.status(400).send({status:false,msg:"Invalid user id"})
    //     }
    //     const user=await userModel.findById({_id:userId})
    //     if(!user){
    //       res.status(400).send({status:false,msg:"user not found"})
    //     }
    //     const cartCheck=await cartModel.findOne({userId:userId})
          
    //     cartId=req.body.cartId
    //     productId=req.body.productId

    //    if(!cartCheck){
    //         //const cartCheck=await cartModel.findById({userId:userId})
    //         const cartData = {items,totalPrice,totalItems}
    //         cartData['userId']=req.params.userId
    //         const createCart=await cartModel.create(cartData)
    //         return res.status(201).send({ status: true, message: `cart created successfully`, data: createCart })
    //       }
    //       else{
          
    //         // //add products in the cart
           
    //         let {items,cartId,totalItems,totalPrice}=requestBody
    //            // get cardId anfd product id from req body
    //         //    if(!(cartId && productId))
    //            if(!cartId )
    //            {
    //             return res.status(400).send({ status: true, message: `provide cartId and productId and product details` })  
    //            }
    //            //make sure card exist
    //            const cart=await cartModel.findById(cartId)
    //            if(!cart){return  res.status(400).send({ status: true, message: `card does not exist` })}

          
    //         const itemsArr=[];//console.log(data[0].value);
    //         itemsArr.push(items[0])
    //         console.log(itemsArr)

    //         let obj={
    //           userId:req.params.userId,
    //            items: itemsArr,
    //            totalPrice: totalPrice,
    //            totalItems: totalItems

    //         }
    //         createCart= await cartModel.create({_id:cartId},{$set:obj},{new:true})
    //         //items.quantity+=quantity
    //         // //{ $inc: { reviews: 1 } }
    //         return res.status(201).send({ status: true, message: `cart created successfully----else`,data: createCart })
    //         }
     
  const userId=req.params.userId
  console.log(userId)
  const requestBody=req.body
  let {items}=requestBody
  if(!validator.isValidObjectId(userId)){
    res.status(400).send({status:false,msg:"Invalid user id"})
  }
  const user=await userModel.findById(userId)
  if(!user){
    res.status(400).send({status:false,msg:"user not found"})
  }
  const cartCheck=await cartModel.findOne({userId:userId})
  console.log("string3",cartCheck)
  console.log("hii",items[0].quantity)
//cart not exists
  if(cartCheck==null){
      const totalItems1=items.length
      const product=await productModel.findOne({_id:items[0].productId,isDeleted:false})
      console.log("producttt",product)
      const totalPrice1=product.price*items[0].quantity
      const cartData = {items:items,totalPrice:totalPrice1,totalItems:totalItems1,userId:userId}
      console.log("cart data:",cartData)
      const createCart=await cartModel.create(cartData)
      console.log("string2",createCart)
      return res.status(201).send({ status: true, message: `cart created successfully`, data: createCart })
    }
    else{
      //add products in the cart
      console.log("hiiiii")
      const product=await productModel.findOne({_id:items[0].productId},{isDeleted:false})
      console.log("product",product)
      const totalPrice1=cartCheck.totalPrice+(product.price*items[0].quantity)
      console.log("totalprice",totalPrice1)
      console.log("String4",items[0].quantity)
      //----------cheking if product  
    //   for(let i=0;i<cartCheck.items.length;i++){
    //   if(cartCheck.items[i].productId==items.productId){
    //     cartCheck.items[i].quantity=cartCheck.items[i].quantity+ items[0].quantity
    //     const response=await cartModel.findOneAndUpdate({userId:userId},{items:cartCheck.items,totalPrice:totalPrice1},{new:true})
    //     return res.status(201).send({ status: true, message: `product added in the cart successfully`, data: response })
    //   }
    //   }
      const totalItems1=items.length+cartCheck.totalItems
      
      const cartData=await cartModel.findOneAndUpdate({userId:userId},{$addToSet:{items:{$each:items}},totalPrice:totalPrice1,totalItems:totalItems1},{new:true})
      return res.status(201).send({ status: true, message: `product added in the cart successfully`, data: cartData })
      
      }
    
}
catch(error){
  return res.status(400).send({ status: false, message:error.message })
}     
    
}

module.exports=
{
    addToCart
}