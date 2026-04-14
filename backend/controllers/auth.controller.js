import AuthService from '../services/auth.service.js';
import ApiError from '../utils/ApiError.js';

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
const register = async (req, res, next) => {
  try {
    const { email, password, name } = req.body;

    const result = await AuthService.register(email, password, name);

    res.status(201).json({
      success: true,
      statusCode: 201,
      message: 'User registered successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const result = await AuthService.login(email, password);

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'Login successful',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/auth/profile
 * @desc    Get user profile
 * @access  Private
 */
const getProfile = async (req, res, next) => {
  try {
    const result = await AuthService.getUserProfile(req.user.userId);

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'Profile fetched successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/auth/profile
 * @desc    Update user profile
 * @access  Private
 */
const updateProfile = async (req, res, next) => {
  try {
    const result = await AuthService.updateProfile(req.user.userId, req.body);

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'Profile updated successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/auth/change-password
 * @desc    Change user password
 * @access  Private
 */
const changePassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      throw new ApiError(400, 'Old password and new password are required');
    }

    const result = await AuthService.changePassword(
      req.user.userId,
      oldPassword,
      newPassword
    );

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'Password changed successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export { register, login, getProfile, updateProfile, changePassword };