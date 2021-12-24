const bcrypt = require("bcrypt");
const aws = require("aws-sdk");
const { validator, jwt } = require("../utils");
//const jwt = require('jsonwebtoken')
const { systemConfig } = require("../configs");
const userModel = require("../models/userModel");
//--------------------------------function for uploading profile image------------------------------------
let uploadFile = async (file) => {
  return new Promise(function (resolve, reject) {
    

    // Create S3 service object
    let s3 = new aws.S3({ apiVersion: "2006-03-01" });
    var uploadParams = {
      ACL: "public-read", // this file is publically readable
      Bucket: "classroom-training-bucket", // HERE
      Key: "group2/project-5/" + file.originalname, // HERE    "group2/project-5/profileImage.png"
      Body: file.buffer,
    };

    // Callback - function provided as the second parameter ( most oftenly)
    s3.upload(uploadParams, function (err, data) {
      if (err) {
        return reject({ error: err });
      }
      console.log(data);
      console.log(`File uploaded successfully. ${data.Location}`);
      return resolve(data.Location); //HERE
    });
  });
};


//---------------------------1st API To Register user ------------------------------------------------
const registerUser = async function (req, res) {
  try {
    const requestBody = req.body;
    //const JSONBody=JSON.parse(requestBody)
    if (!validator.isValidRequestBody(requestBody)) {
      return res.status(400).send({ status: false, message: 'Invalid request parameters. Please provide user details' })
    }

    // Extract params
    let { fname, lname, email, profileImage, phone, password, address } = requestBody; // Object destructing

    // Validation starts
    if (!validator.isValid(fname)) {
      return res.status(400).send({ status: false, message: 'first name is required' })
    }
    if (!validator.isValid(lname)) {
      return res.status(400).send({ status: false, message: 'last name is required' })
    }
    if (!validator.isValid(email)) {
      return res.status(400).send({ status: false, message: `Email is required` })
    }

    if (!validator.validateEmail(email)) {
      return res.status(400).send({ status: false, message: `Email should be a valid email address` })
    }
    let isEmailAlredyPresent = await userModel.findOne({ email: requestBody.email })

    if (isEmailAlredyPresent) {
      return res.status(400).send({ status: false, message: `Email Already Present` });
    }

    if (!validator.isValid(phone)) {
      return res.status(400).send({ status: false, message: 'Phone number is required' })
    }
    if (!/^(?:(?:\+|0{0,2})91(\s*[\-]\s*)?|[0]?)?[6789]\d{9}$/.test(phone)) {
      //if (!/^\+(?:[0-9] ?){10,12}[0-9]$/.test(mobile)) {
      return res.status(400).send({ status: false, message: `Mobile should be a valid number` });

    }
    /*if(!validator.isValidNumber(phone)) {
        return res.status(400).send({status: false, message: 'Phone number should be a valid number'})
    }*/
    let isPhoneAlredyPresent = await userModel.findOne({ phone: requestBody.phone })

    if (isPhoneAlredyPresent) {
      return res.status(400).send({ status: false, message: `Phone Already Present` });
    }
    if (!validator.isValid(password)) {
      return res.status(400).send({ status: false, message: `Password is required` })
    }
    if (!validator.isValidLength(password, 8, 15)) {
      return res.status(400).send({ status: false, message: `Password length must be between 8 to 15 char long` })
    }

    if (!validator.isValid(address)) {
      return res.status(400).send({ status: false, message: 'address is required' })
    }
    if (!validator.isValid(address.shipping)) {
      return res.status(400).send({ status: false, message: 'shipping address is required' })
    }
    if (!validator.isValid(address.shipping.street)) {
      return res.status(400).send({ status: false, message: 'shipping street is required' })
    }
    if (!validator.isValid(address.shipping.city)) {
      return res.status(400).send({ status: false, message: 'shipping city is required' })
    }
    if (!validator.isValid(address.shipping.pincode)) {
      return res.status(400).send({ status: false, message: 'shipping pincode is required' })
    }
    if (!validator.isValid(address.billing)) {
      return res.status(400).send({ status: false, message: 'billing address is required' })
    }
    if (!validator.isValid(address.billing.street)) {
      return res.status(400).send({ status: false, message: ' billing street is required' })
    }
    if (!validator.isValid(address.billing.city)) {
      return res.status(400).send({ status: false, message: 'billing city is required' })
    }
    if (!validator.isValid(address.billing.pincode)) {
      return res.status(400).send({ status: false, message: 'billing pincode is required' })
    }
    // Validation ends
    let files = req.files;
    if (files && files.length > 0) {
      let uploadedFileURL = await uploadFile(files[0]);
      //requestBody.profileImage=uploadedFileURL
      const encrypt = await bcrypt.hash(password, 10)
      //profileImage=uploadedFileURL  
      const userData = { fname, lname, email, profileImage: uploadedFileURL, phone, password: encrypt, address }
      const newUser = await userModel.create(userData);
      return res.status(201).send({ status: true, message: `User created successfully`, data: newUser })
    }
    else {
      res.status(400).send({ status: false, msg: "No file to write" });
    }
  }
  catch (error) {
    return res.status(500).send({ status: false, message: error.message })
  }
}




// const registerUser = async function (req, res) {
//   try {
//     const requestBody = req.body;
//     if (!validator.isValidRequestBody(requestBody)) {
//       return res
//         .status(400)
//         .send({
//           status: false,
//           message: "Invalid request parameters. Please provide user details",
//         });
//     }

//     // Extract params
//     let { fname, lname, email, profileImage, phone, password, address } =
//       requestBody; // Object destructing

//     // Validation starts
//     if (!validator.isValid(fname)) {
//       return res
//         .status(400)
//         .send({ status: false, message: "first name is required" });
//     }
//     if (!validator.isValid(lname)) {
//       return res
//         .status(400)
//         .send({ status: false, message: "last name is required" });
//     }
//     if (!validator.isValid(email)) {
//       return res
//         .status(400)
//         .send({ status: false, message: `Email is required` });
//     }

//     if (!validator.validateEmail(email)) {
//       return res
//         .status(400)
//         .send({
//           status: false,
//           message: `Email should be a valid email address`,
//         });
//     }
//     let isEmailAlredyPresent = await userModel.findOne({
//       email: requestBody.email,
//     });

//     if (isEmailAlredyPresent) {
//       return res
//         .status(400)
//         .send({ status: false, message: `Email Already Present` });
//     }
//     if (!validator.isValid(profileImage)) {
//       return res
//         .status(400)
//         .send({ status: false, message: `profileImage is required` });
//     }
//     if (!validator.isValid(phone)) {
//       return res
//         .status(400)
//         .send({ status: false, message: "Phone number is required" });
//     }
//     if (!validator.isValidNumber(phone)) {
//       return res
//         .status(400)
//         .send({
//           status: false,
//           message: "Phone number should be a valid number",
//         });
//     }
//     let isPhoneAlredyPresent = await userModel.findOne({
//       email: requestBody.phone,
//     });

//     if (isPhoneAlredyPresent) {
//       return res
//         .status(400)
//         .send({ status: false, message: `Phone Already Present` });
//     }
//     if (!validator.isValid(password)) {
//       return res
//         .status(400)
//         .send({ status: false, message: `Password is required` });
//     }
//     if (!validator.isValidLength(password, 8, 15)) {
//       return res
//         .status(400)
//         .send({
//           status: false,
//           message: `Password lenght must be between 8 to 15 char long`,
//         });
//     }
//     if (!validator.isValid(address.shipping.street)) {
//       return res
//         .status(400)
//         .send({ status: false, message: "first name is required" });
//     }
//     if (!validator.isValid(address.shipping.city)) {
//       return res
//         .status(400)
//         .send({ status: false, message: "first name is required" });
//     }
//     if (!validator.isValid(address.shipping.pincode)) {
//       return res
//         .status(400)
//         .send({ status: false, message: "first name is required" });
//     }
//     if (!validator.isValid(address.billing.street)) {
//       return res
//         .status(400)
//         .send({ status: false, message: "first name is required" });
//     }
//     if (!validator.isValid(address.billing.city)) {
//       return res
//         .status(400)
//         .send({ status: false, message: "first name is required" });
//     }
//     if (!validator.isValid(address.billing.pincode)) {
//       return res
//         .status(400)
//         .send({ status: false, message: "first name is required" });
//     }
//     // Validation ends

//     var encrypt=await bcrypt.hash(password, 10)


//     const userData = {
//       fname,
//       lname,
//       email,
//       profileImage,
//       phone,
//       password:encrypt,
//       address,
//     };
//     const newUser = await userModel.create(userData);
//     return res
//       .status(201)
//       .send({
//         status: true,
//         message: `User created successfully`,
//         data: newUser,
//       });
//   } catch (error) {
//     return res.status(500).send({ status: false, message: error.message });
//   }
// };
//---------------------------------mycode-------------------------------------------

//----------------------------loginUser-------------------------------------------------------

const loginUser = async function (req, res) {
  try {
    const requestBody = req.body;

    if (!validator.isValidRequestBody(requestBody)) {
      return res
        .status(400)
        .send({
          status: false,
          message: "Invalid request parameters. Please provide login details",
        });
      return;
    }

    // Extract params
    const { email, password } = requestBody;

    // Validation starts
    if (!validator.isValid(email)) {
      return res
        .status(400)
        .send({ status: false, message: `Email is required` });
    }

    if (!validator.validateEmail(email)) {
      return res
        .status(400)
        .send({
          status: false,
          message: `Email should be a valid email address`,
        });
    }

    if (!validator.isValid(password)) {
      return res
        .status(400)
        .send({ status: false, message: `Password is required` });
    }

    // Validation ends
    console.log(email, password)

    const user = await userModel.findOne({ email });

    if (!user) {
      return res
        .status(401)
        .send({ status: false, message: `user not exist` });
    }

    //console.log(user)
    const validPassword = await bcrypt.compare(password, user.password);
    console.log(validPassword)

    if (validPassword) {
      console.log(email, validPassword)

      const token = await jwt.createToken({
        userId: user._id, iat: Math.floor(Date.now() / 1000),//issue date
        // exp:Math.floor(Date.now()/1000)+30 *60//expiry  date
      });

      return res
        .status(200)
        .send({
          status: true,
          message: `User login successfull`,
          data: { userId: user._id, token: token },
        });
    }
    else {
      return res
        .status(400)
        .send({ status: false, message: `put correct Password` });
    }
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
}

//----------------------------getUserProfile-------------------------------------------------------

const getUserProfile = async function (req, res) {
  try {
    const user_Id = req.params.userId;
    const userId = req.userId;

    // console.log(typeof userId)
    if (!validator.isValidObjectId(user_Id)) {
      return res
        .status(400)
        .send({ status: false, message: `${userId} is not a valid user id` });
    }

    const user = await userModel.findById({ _id: user_Id });

    if (!user) {
      return res
        .status(404)
        .send({ status: false, message: `User does not exit` });
    }

    //console.log(typeof user['_id'].toString())
    if (user["_id"].toString() !== userId) {
      return res
        .status(401)
        .send({
          status: false,
          message: `Unauthorized access! user info doesn't match`,
        });
      return;
    }

    return res
      .status(200)
      .send({ status: true, message: "User profile details", data: user });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};
//----------------------------updateUser-------------------------------------------------------
const updateUser = async function (req, res) {
  try {
    const requestBody = req.body
    const userId = req.params.userId;

    if (!validator.isValidObjectId(userId)) {
      return res
        .status(400)
        .send({ status: false, message: `${userId} is not a valid user id` });
    }
    const user = await userModel.findById({ _id: userId });

    if (!user) {
      return res
        .status(404)
        .send({ status: false, message: `User does not exit` });
    }
    //console.log(typeof user['_id'].toString())
    if (user["_id"].toString() !== userId) {
      return res
        .status(401)
        .send({
          status: false,
          message: `Unauthorized access! user info doesn't match`,
        });
    }

    if (!validator.isValidRequestBody(requestBody)) {
      return res.status(400).send({ status: false, message: 'No paramateres passed. user unmodified', data: user })
    }

    const { fname, lname, email, profileImage, phone, password, address } = requestBody;
    const updatedUserData = {}



    if (validator.isValid(fname)) {
      if (!Object.prototype.hasOwnProperty.call(updatedUserData, '$set'))
        updatedUserData['$set'] = {}
      updatedUserData['$set']['fname'] = fname
    }
    if (validator.isValid(lname)) {
      if (!Object.prototype.hasOwnProperty.call(updatedUserData, '$set'))
        updatedUserData['$set'] = {}
      updatedUserData['$set']['lname'] = lname
    }

    if (validator.isValid(email)) {
      const isemailAlreadyUsed = await userModel.findOne({ email, _id: userId });

      if (isemailAlreadyUsed) {
        return res.status(400).send({ status: false, message: `${email} email is already used` })
      }

      if (!Object.prototype.hasOwnProperty.call(updatedUserData, '$set'))
        updatedUserData['$set'] = {}
      updatedUserData['$set']['email'] = email
    }

    if (validator.isValid(profileImage)) {
      if (!Object.prototype.hasOwnProperty.call(updatedUserData, '$set'))
        updatedUserData['$set'] = {}
      updatedUserData['$set']['profileImage'] = profileImage
    }



    if (validator.isValid(phone)) {
      const isphoneAlreadyUsed = await userModel.findOne({ phone, _id: userId });

      if (isphoneAlreadyUsed) {
        return res.status(400).send({ status: false, message: `${phone} phone is already exist` })
      }

      if (!Object.prototype.hasOwnProperty.call(updatedUserData, '$set'))
        updatedUserData['$set'] = {}
      updatedUserData['$set']['phone'] = phone
    }

    if (validator.isValid(password)) {
      if (!Object.prototype.hasOwnProperty.call(updatedUserData, '$set'))
        updatedUserData['$set'] = {}
      updatedUserData['$set']['password'] = password
    }
    //address.shipping
    if (validator.isValid(address['shipping'].street)) {
      if (!Object.prototype.hasOwnProperty.call(updatedUserData, '$set'))
        updatedUserData['$set'] = {}
      updatedUserData['$set']['address.shipping.street'] = address.shipping.street
    }

    if (validator.isValid(address.shipping.city)) {
      if (!Object.prototype.hasOwnProperty.call(updatedUserData, '$set'))
        updatedUserData['$set'] = {}
      updatedUserData['$set']['address.shipping.city'] = address.shipping.city
    }
    if (validator.isValid(address.shipping.pincode)) {
      if (!Object.prototype.hasOwnProperty.call(updatedUserData, '$set'))
        updatedUserData['$set'] = {}
      updatedUserData['$set']['address.shipping.pincode'] = address.shipping.pincode
    }
    // //address.billing
    // if (validator.isValid(address.billing.street)) {
    //   if (!Object.prototype.hasOwnProperty.call(updatedUserData, '$set'))
    //     updatedUserData['$set'] = {}
    //   updatedUserData['$set']['address.billing.street'] = address.billing.street
    // }

    // if (validator.isValid(address.billing.city)) {
    //   if (!Object.prototype.hasOwnProperty.call(updatedUserData, '$set'))
    //     updatedUserData['$set'] = {}
    //   updatedUserData['$set']['address.billing.city'] = address.billing.city
    // }

    // if (validator.isValid(address.billing.pincode)) {
    //   if (!Object.prototype.hasOwnProperty.call(updatedUserData, '$set'))
    //     updatedUserData['$set'] = {}
    //   updatedUserData['$set']['address.billing.pincode'] = address.billing.pincode
    // }

    const updatedUser = await userModel.findOneAndUpdate({ _id: userId }, updatedUserData, { new: true })

    return res
      .status(200)
      .send({
        status: true,
        message: "User profile Updated",
        data: updatedUser
      });

  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};

module.exports = {
  registerUser,
  // uploadImage,
  loginUser,
  getUserProfile,
  updateUser
};
