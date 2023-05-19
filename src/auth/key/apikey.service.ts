import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ApiKey } from './apikey.model';
import { Model } from 'mongoose';
import { SignupDto } from '../dto/signup.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class ApiKeyService {
  constructor(@InjectModel(ApiKey.name) private apiKeyModel: Model<ApiKey>) {}

  async createApiKey(signupDto: SignupDto): Promise<ApiKey> {
    try {
      const salt = await bcrypt.genSalt();
      const hashedPassword = await bcrypt.hash(signupDto.password, salt);
      const createdApiKey = new this.apiKeyModel({
        key: await bcrypt.hash(`${signupDto.email}${Date.now()}`, salt),
        name: signupDto.name,
        email: signupDto.email,
        password: hashedPassword,
      });

      return createdApiKey.save();
    } catch (error) {
      throw new Error('Failed to create API key');
    }
  }

  async validateApiKey(apiKey: string): Promise<boolean> {
    try {
      const apiKeyInfo = await this.apiKeyModel.findOne({ key: apiKey });

      if (apiKeyInfo) {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      throw new NotFoundException('API key validation failed');
    }
  }

  async findApiKeyByEmail(email: string): Promise<ApiKey> {
    try {
      return this.apiKeyModel.findOne({ email: email });
    } catch (error) {
      throw new NotFoundException('API key not found');
    }
  }

  async findById(id: string): Promise<ApiKey> {
    try {
      return this.apiKeyModel.findById(id).exec();
    } catch (error) {
      throw new NotFoundException('API key not found');
    }
  }

  async comparePassword(apiKey: ApiKey, password: string): Promise<boolean> {
    try {
      return bcrypt.compare(password, apiKey.password);
    } catch (error) {
      throw new Error('Failed to compare passwords');
    }
  }
}
