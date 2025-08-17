const express = require('express');
const router = express.Router();
const authController = require('../controllers/AuthController');

router.post('/user/signup', authController.signup);
router.post('/user/login', authController.login);
router.post("/forgotpassword/update", authController.updatePasswordByPhone);


// Protected route example
router.get('/protected', authController.protect, (req, res) => {
  res.status(200).json({
    status: 'success',
    data: {
      user: req.user
    }
  });
});

module.exports = router;