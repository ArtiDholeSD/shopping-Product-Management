const mongoose = require('mongoose')
const ObjectId=mongoose.Schema.Types.ObjectId
const cartSchema = new mongoose.Schema({
    userId:{
        type:ObjectId,
        ref:'user',
        required:true,
        unique:true,
        trim:true
    },
    items:[{
        productId:{
            type:ObjectId,
            ref:'product',
            required:true,
            trim:true
        },
        quantity:{
            type:Number,
            required:true,
            min:1,
            trim:true
        }
    }],
    totalprice:{
        type:Number,
        required:true,
        trim:true
    },
    totalItems:{
        type:Number,
        required:true,
        trim:true
    }
},{timeStamps:true})

module.exports = mongoose.model('cart', cartSchema)






// {
//     userId: {ObjectId, refs to User, mandatory, unique},
//     items: [{
//       productId: {ObjectId, refs to Product model, mandatory},
//       quantity: {number, mandatory, min 1}
//     }],
//     totalPrice: {number, mandatory, comment: "Holds total price of all the items in the cart"},
//     totalItems: {number, mandatory, comment: "Holds total number of items in the cart"},
//     createdAt: {timestamp},
//     updatedAt: {timestamp},
//   }