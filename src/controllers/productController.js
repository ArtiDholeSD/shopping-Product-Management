const productModel = require('../models/productModel');
const { validator, jwt } = require('../utils');
const awsObj = require('../utils/aws.js');




//---------------------------1st API To Create Product ------------------------------------------------
const CreateProduct = async function (req, res) {
    try {
        const requestBody = req.body;

        if (!validator.isValidRequestBody(requestBody)) {
            return res.status(400).send({
                sttaus: false,
                message: 'Invalid request parameters. Please Provide Product Details'
            })
        }

        // Extract params
        let { title, description, price, currencyId, currencyFormat, isFreeShipping, productImage, style, availableSizes, installments } = requestBody; //deletedAt,isDeleted// Object destructing

        // Validation starts
        //  const objArrayKey = Object.keys(requestBody)// we got array of keys
        //  const objArrayValues = Object.values(requestBody)// we got array of Values 
        //  //console.log(objArrayValues)

        //  const check = objArrayValues.map((e)=>{
        //     if(!validator.isValid(e)){
               
        //      throw new Error("invalid book id")
        //      }
        //     return res.status(400).send({ status: false, message: `${e} is required` })
        //  })
        //  console.log(check)

    
        if (!validator.isValid(title)) {
            return res.status(400).send({ status: false, message: 'Title is required' })
        }
        let isTitleAlreadyExist = await productModel.findOne({ title })
        if (isTitleAlreadyExist) {
            return res.status(400).send({ status: false, message: `Title Already Present` });
        }
        if (!validator.isValid(description)) {
            return res.status(400).send({ status: false, message: 'description is required' })
        }
        if (!validator.isValid(price)) {
            return res.status(400).send({ status: false, message: `price is required` })
        }
        if (!validator.isValid(currencyId)) {
            return res.status(400).send({ staus: false, message: `currencyId is required` })
        }
        if (!validator.isValid(currencyFormat)) {
            return res.status(400).send({ status: false, message: 'currencyFormat is required' })
        }


        let files = req.files;
        if (files && files.length > 0) {
            let uploadedFileURL = await awsObj.uploadFile(files[0]);

            const productData = { title, description, price, currencyId, currencyFormat, isFreeShipping, productImage: uploadedFileURL, style, availableSizes, installments }

            const newProduct = await productModel.create(productData);
            return res.status(201).send({ status: false, message: "Product added succsessfully", data: newProduct });
        }
        else {
           return res.status(400).send({ status: false, msg: "No file to write" });
        }


    } catch (e) {
        return res.status(500).send({ status: false, message: e.message })
    }

}

//----------------------------------get Products by serch filters---------------------------------
const getProducts = async function (req, res) {
    try {
        let filter = { isDeleted: false }
        const queryParams = req.query
        if (validator.isValidRequestBody(queryParams)) {

            //const data = await productModel.find({title:{$regex:name ,$options:"$i"}})//.sort({ price})

            const { availableSizes, name, priceSort } = queryParams;

            if (validator.isValid(availableSizes)) {
                filter['availableSizes'] = availableSizes
            }
            if (validator.isValid(name)) {
                const data = await productModel.find({ title: { $regex: name, $options: "$i" } }).sort({ price: priceSort })
                return res.status(200).send({ status: true, message: 'product lists', data: data })
            }
            console.log(priceSort)
            let priceGreaterThan = req.query.priceGreaterThan
           // console.log(priceGreaterThan)
            let priceLessThan = req.query.priceLessThan
            //console.log(priceLessThan)

            if (priceGreaterThan && priceLessThan) {
                if (validator.isValid(priceGreaterThan && priceLessThan)) {
                    const priceRange = await productModel.find({ price: { $gte: priceGreaterThan, $lte: priceLessThan } }, { isDeleted: false }).sort({ price: priceSort })
                    return res.status(200).send({ status: true, message: 'product lists', data: priceRange })
                }
                else {
                    return res.status(400).send({ status: false, message: ' price not valid' })
                }
            }
            if (priceGreaterThan) {
                if (validator.isValid(priceGreaterThan)) {
                    const priceRange = await productModel.find({ price: { $gte: priceGreaterThan } }, { isDeleted: false }).sort({ price: priceSort })
                    return res.status(200).send({ status: true, message: 'product lists', data: priceRange })
                }
                else {
                    return res.status(400).send({ status: false, message: ' price not valid' })
                }
            }
            if (priceLessThan) {
                if (validator.isValid(priceLessThan)) {
                    const priceRange = await productModel.find({ price: { $lte: priceLessThan } }, { isDeleted: false }).sort({ price: priceSort })
                    return res.status(200).send({ status: true, message: 'product lists', data: priceRange })
                }
                else {
                    return res.status(400).send({ status: false, message: ' price not valid' })
                }
            }

            console.log(priceSort)
            const data = await productModel.find(filter).sort({ price: priceSort })//title and sizes
            if (Array.isArray(data) && data.length === 0) {
                return res.status(404).send({ status: false, message: 'No data found' })
            }
    
            return res.status(200).send({ status: true, message: 'product lists', data: data })
        }
       
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
}

//---------------------------get Product By Id ------------------------------------------------
const getProductById = async function (req, res) {
    try {
        const productId = req.params.productId

        if (!validator.isValid(productId)) {
            return res.status(400).send({ status: false, message: `provide a Product Id` })
        }
        if (!validator.isValidObjectId(productId)) {
            return res.status(400).send({ status: false, message: `Product Id is not valid Product Id` })
        }
        const product = await productModel.findOne({ _id: productId, isdeleted: false }).select({__v:0})//( await is not neccessary optional)
        if (!product) {
            return res.status(404).send({ status: false, message: `Product not exist` })
        }

        return res.status(200).send({ status: true, message: 'Success', data: product });


    } catch (e) {
        return res.status(500).send({ status: false, message: e.message })
    }

}
//---------------------------UpdateProductById------------------------------------------------

const UpdateProductById = async function (req, res) {
    try {
        const productId = req.params.productId;

        let requestBody = req.body;

        if (!validator.isValidObjectId(productId)) {
            return res.status(400).send({ status: false, message: `invalid  Product Id` })
        }
        let filter = { isDeleted: false, _id: productId }
        const product = await productModel.find(filter)

        if (!product) {
            return res.status(404).send({ status: false, message: `product not Exist` })
        }
        if (!validator.isValidRequestBody(requestBody)) {
            res.status(400).send({ status: false, message: 'No paramateres passed. product unmodified' })
            return
        }
        // Extract params
        let { title, description, price, currencyId, currencyFormat, isFreeShipping, productImage, style, availableSizes, installments } = requestBody;
        console.log(price)
        let tempObj = {}
        if (validator.isValidString(title)) {
            let istitlePresent = await productModel.findOne({ title: requestBody.title })

            // console.log(istitlePresent)
            if (istitlePresent) {
                return res.status(400).send({ status: false, message: `title is Already Present` });
            }

            tempObj['title'] = title;
        }

        if (validator.isValidString(description)) {

            console.log(description)
            tempObj['description'] = description;
        }
        if (validator.isValidNumber(price)) {
            console.log(price)
            tempObj['price'] = price
        }
        if (validator.isValidString(currencyId)) {
            tempObj['currencyId'] = currencyId
        }
        if (validator.isValidSymbol(currencyFormat)) {
            tempObj['currencyFormat'] = currencyFormat
        }
        if (validator.isValid(isFreeShipping)) {
            tempObj['isFreeShipping'] = isFreeShipping
        }

        let files = req.files;
        if (files && files.length > 0) {
            let uploadedFileURL = await awsObj.uploadFile(files[0]);
            //console.log("string1",uploadedFileURL)
            if (uploadedFileURL) {
                //console.log("string2",uploadedFileURL)
                tempObj['productImage'] = uploadedFileURL
            }
        }
        if (validator.isValidString(style)) {
            tempObj['style'] = style;
        }
      
        //validation remaining
        if (validator.isValidString(availableSizes)) {
            tempObj['availableSizes'] = availableSizes;
        }
        if (validator.isValidString(installments)) {
            tempObj['installments'] = installments;
        }

        const updatedProductData = await productModel.findOneAndUpdate({ _id: productId }, tempObj, { new: true })

        res.status(201).send({ status: true, message: `data upadated successfully`, data: updatedProductData })

    } catch (e) {
        return res.status(500).send({ status: false, message: e.message })
    }

}

//------------------------------delete product by id -----------------------------------
const deleteProduct = async function (req, res) {
    try {

        const productId = req.params.productId
        if (!validator.isValid(productId)) {
            return res.status(400).send({ status: false, message: `${productId} is not a valid product id` })
        }
        const product = await productModel.findOne({ _id: productId, isDeleted: false })

        if (!product) return res.status(404).send({ status: false, message: 'Product not exist or already deleted ' })
        const deletedProduct = await productModel.findByIdAndUpdate({ _id: productId }, { isDeleted: true, deletedAt: new Date() }, { new: true })
        return res.status(202).send({ status: true, message: `product deleted Successfully`, data: deletedProduct })
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
}



module.exports = {
    CreateProduct,
    getProducts,
    getProductById,
    UpdateProductById,
    deleteProduct

}