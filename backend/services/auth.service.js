import User from '../models/user.model.js';
import { generateToken } from '../utils/generateToken.js';
import ApiError from '../utils/ApiError.js';

class AuthService {
  /**
   * Register a new user
   */
  static async register(email, password, name) {
    try {
      // Check if user already exists
      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        throw new ApiError(400, 'Email already registered');
      }

      // Hash password
      const hashedPassword = await User.hashPassword(password);

      // Create user
      const user = await User.create(email, hashedPassword, name);

      // Generate token
      const token = generateToken(user.id, user.email);

      return {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
        token,
      };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(500, error.message || 'Registration failed');
    }
  }

  /**
   * Login user
   */
  static async login(email, password) {
    try {
      // Find user by email
      const user = await User.findByEmail(email);
      if (!user) {
        throw new ApiError(401, 'Invalid email or password');
      }

      // Compare passwords
      const isPasswordCorrect = await User.comparePassword(password, user.password);
      if (!isPasswordCorrect) {
        throw new ApiError(401, 'Invalid email or password');
      }

      // Generate token
      const token = generateToken(user.id, user.email);

      return {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
        token,
      };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(500, error.message || 'Login failed');
    }
  }

  /**
   * Get user profile
   */
  static async getUserProfile(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new ApiError(404, 'User not found');
      }

      return {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          createdAt: user.created_at,
        },
      };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(500, error.message || 'Failed to fetch user profile');
    }
  }

  /**
   * Update user profile
   */
  static async updateProfile(userId, updateData) {
    try {
      // Remove sensitive fields from update
      delete updateData.password;
      delete updateData.id;

      const updatedUser = await User.update(userId, updateData);
      if (!updatedUser) {
        throw new ApiError(404, 'User not found');
      }

      return {
        success: true,
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          name: updatedUser.name,
        },
      };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(500, error.message || 'Failed to update profile');
    }
  }

  /**
   * Change password
   */
  static async changePassword(userId, oldPassword, newPassword) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new ApiError(404, 'User not found');
      }

      // Verify old password
      const isPasswordCorrect = await User.comparePassword(oldPassword, user.password);
      if (!isPasswordCorrect) {
        throw new ApiError(401, 'Old password is incorrect');
      }

      // Hash new password
      const hashedPassword = await User.hashPassword(newPassword);

      // Update password
      await User.update(userId, { password: hashedPassword });

      return {
        success: true,
        message: 'Password changed successfully',
      };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(500, error.message || 'Failed to change password');
    }
  }
}

export default AuthService;