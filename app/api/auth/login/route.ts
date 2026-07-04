import { NextResponse, NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/db';
import User from '@/models/User';
import ActivityLog from '@/models/ActivityLog';
import { loginSchema } from '@/lib/validators';
import { signToken, AUTH_COOKIE_NAME } from '@/lib/auth';
import { rateLimit } from '@/lib/rateLimiter';

export async function POST(req: NextRequest) {
  try {
    // 0. Rate limiting (5 login attempts per minute limit)
    const rateLimitRes = await rateLimit(req, { limit: 5, windowMs: 60 * 1000 });
    const headers = {
      'X-RateLimit-Limit': rateLimitRes.limit.toString(),
      'X-RateLimit-Remaining': rateLimitRes.remaining.toString(),
      'X-RateLimit-Reset': rateLimitRes.resetTime.toString(),
    };

    if (!rateLimitRes.success) {
      return NextResponse.json(
        {
          error: {
            code: 'TOO_MANY_REQUESTS',
            message: 'Too many login attempts. Please wait a minute and try again.',
          },
        },
        { status: 429, headers }
      );
    }

    const body = await req.json();

    // 1. Validate Input
    const validatedData = loginSchema.safeParse(body);
    if (!validatedData.success) {
      const fieldErrors = validatedData.error.flatten().fieldErrors;
      return NextResponse.json(
        {
          message: 'Invalid input',
          errors: fieldErrors,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Validation failed for request inputs.',
            details: fieldErrors,
          },
        },
        { status: 400 }
      );
    }

    const { email, password } = validatedData.data;

    await connectDB();

    // 2. Find User
    const user = await User.findOne({ email: email.toLowerCase() }).select('+passwordHash');
    if (!user) {
      return NextResponse.json(
        {
          message: 'Invalid email or password',
          error: {
            code: 'INVALID_CREDENTIALS',
            message: 'The email address or password you entered is incorrect.',
          },
        },
        { status: 401 }
      );
    }

    // 3. Verify Password
    const isPasswordCorrect = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordCorrect) {
      return NextResponse.json(
        {
          message: 'Invalid email or password',
          error: {
            code: 'INVALID_CREDENTIALS',
            message: 'The email address or password you entered is incorrect.',
          },
        },
        { status: 401 }
      );
    }

    // 4. Generate Token
    const token = await signToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    // 5. Log Activity (Optional but good for history)
    await ActivityLog.create({
      userId: user._id,
      action: 'login',
      resourceType: 'user',
      description: 'User logged in to the dashboard',
    });

    // 6. Set Cookie
    const response = NextResponse.json(
      { message: 'Login successful', user: { id: user._id, name: user.name, email: user.email } },
      { status: 200 }
    );

    response.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;

  } catch (error: any) {
    console.error('Login Error:', error);
    return NextResponse.json(
      {
        message: 'Internal server error',
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || 'An unexpected error occurred.',
        },
      },
      { status: 500 }
    );
  }
}
