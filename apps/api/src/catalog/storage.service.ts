import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import * as path from 'path';

export interface UploadResult {
  url: string;
  path: string;
  size: number;
  mimetype: string;
}

/**
 * Storage service for file uploads.
 *
 * Supports:
 *   - Supabase Storage (production)
 *   - Local filesystem (development)
 *
 * Configuration via env vars:
 *   SUPABASE_URL, SUPABASE_SERVICE_KEY, SUPABASE_STORAGE_BUCKET
 */
@Injectable()
export class StorageService {
  private readonly logger = new Logger('StorageService');
  private supabase: any = null;
  private bucket: string;
  private useSupabase = false;

  constructor() {
    this.bucket = process.env.SUPABASE_STORAGE_BUCKET || 'product-images';
    this.initSupabase();
  }

  private initSupabase(): void {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_KEY;

    if (!url || !key) {
      this.logger.warn('Supabase not configured — using local storage');
      return;
    }

    try {
      const { createClient } = require('@supabase/supabase-js');
      this.supabase = createClient(url, key);
      this.useSupabase = true;
      this.logger.log('Supabase Storage connected');
    } catch (err: any) {
      this.logger.warn(`Supabase client not available: ${err.message}`);
    }
  }

  /**
   * Upload a product image.
   *
   * @param file - Multer file object (buffer, originalname, mimetype)
   * @param tenantSlug - Tenant slug for path isolation
   * @param productId - Product ID
   * @returns UploadResult with public URL
   */
  async uploadProductImage(
    file: any,
    tenantSlug: string,
    productId: string,
  ): Promise<UploadResult> {
    this.validateFile(file);

    const ext = path.extname(file.originalname).toLowerCase();
    const filename = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}${ext}`;
    const filePath = `products/${tenantSlug}/${productId}/${filename}`;

    if (this.useSupabase) {
      return this.uploadToSupabase(file, filePath);
    }

    return this.uploadLocal(file, filePath);
  }

  /**
   * Upload to Supabase Storage.
   */
  private async uploadToSupabase(
    file: any,
    filePath: string,
  ): Promise<UploadResult> {
    const { data, error } = await this.supabase.storage
      .from(this.bucket)
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (error) {
      throw new BadRequestException(`Error uploading file: ${error.message}`);
    }

    // Get public URL
    const { data: urlData } = this.supabase.storage
      .from(this.bucket)
      .getPublicUrl(filePath);

    return {
      url: urlData.publicUrl,
      path: filePath,
      size: file.size,
      mimetype: file.mimetype,
    };
  }

  /**
   * Upload to local filesystem (development).
   */
  private async uploadLocal(
    file: any,
    filePath: string,
  ): Promise<UploadResult> {
    const fs = require('fs');
    const uploadDir = path.join(process.cwd(), 'uploads', 'products');

    // Create directory
    const dir = path.dirname(path.join(uploadDir, filePath));
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Write file
    const fullPath = path.join(uploadDir, filePath);
    fs.writeFileSync(fullPath, file.buffer);

    // Return URL relative to uploads
    const publicUrl = `/uploads/products/${filePath}`;

    return {
      url: publicUrl,
      path: filePath,
      size: file.size,
      mimetype: file.mimetype,
    };
  }

  /**
   * Delete a product image.
   */
  async deleteProductImage(filePath: string): Promise<void> {
    if (this.useSupabase) {
      const { error } = await this.supabase.storage
        .from(this.bucket)
        .remove([filePath]);

      if (error) {
        this.logger.error(`Error deleting file: ${error.message}`);
      }
      return;
    }

    // Local deletion
    const fs = require('fs');
    const fullPath = path.join(process.cwd(), 'uploads', 'products', filePath);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }
  }

  /**
   * Validate uploaded file.
   */
  private validateFile(file: any): void {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!allowedTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        `Tipo de archivo no permitido: ${file.mimetype}. Tipos permitidos: ${allowedTypes.join(', ')}`,
      );
    }

    if (file.size > maxSize) {
      throw new BadRequestException(
        `Archivo demasiado grande: ${(file.size / 1024 / 1024).toFixed(1)}MB. Máximo: 5MB`,
      );
    }
  }

  /**
   * Get storage stats.
   */
  async getStats(): Promise<{ provider: string; bucket?: string }> {
    if (this.useSupabase) {
      return { provider: 'supabase', bucket: this.bucket };
    }
    return { provider: 'local' };
  }
}
