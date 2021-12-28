const express = require('express');
const router = express.Router();


const UserController = require('../controllers/userController')
const ProductController=require('../controllers/productController')
const CartController=require('../controllers/cartController')
const {authMiddleware} = require('../middlewares')



//----------user register ---------------------------------------------------------------
router.post("/register", UserController.registerUser)
router.post("/login",UserController.loginUser)

router.get('/user/:userId/profile', authMiddleware, UserController.getUserProfile)
//router.put('/user/:userId/profile', authMiddleware, UserController.updateUser)
router.put('/user/:userId/profile', authMiddleware, UserController.updateUser1)


//----------create Product ---------------------------------------------------------------
router.post("/products",ProductController.CreateProduct)
router.get("/products",ProductController.getProducts)
router.get("/products/:productId",ProductController.getProductById)
router.put("/products/:productId",ProductController.UpdateProductById)
router.delete("/products/:productId",ProductController.deleteProduct)



//----------create cart ---------------------------------------------------------------

router.post('/users/:userId/cart',CartController.addToCart)

module.exports = router;