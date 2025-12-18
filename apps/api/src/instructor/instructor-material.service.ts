import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaClient, MaterialType } from '@prisma/client';

interface CreateModuleDto {
  title: string;
  description?: string;
  order: number;
}

interface UpdateModuleDto {
  title?: string;
  description?: string;
  order?: number;
  isPublished?: boolean;
}

interface CreateMaterialDto {
  title: string;
  description?: string;
  type: MaterialType;
  fileUrl?: string;
  content?: string;
  order: number;
  moduleId?: string;
}

interface UpdateMaterialDto {
  title?: string;
  description?: string;
  type?: MaterialType;
  fileUrl?: string;
  fileSize?: number;
  duration?: string;
  order?: number;
  isPublished?: boolean;
}

@Injectable()
export class InstructorMaterialService {
  constructor(private prisma: PrismaClient) {}

  // ============ MODULE OPERATIONS ============

  async createModule(courseId: string, instructorId: string, data: CreateModuleDto) {
    // Verify course ownership
    const course = await this.prisma.course.findUnique({
      where: { id: courseId }
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    if (course.instructorId !== instructorId) {
      throw new ForbiddenException('You can only create modules for your own courses');
    }

    return this.prisma.courseModule.create({
      data: {
        courseId,
        title: data.title,
        description: data.description,
        order: data.order,
      },
      include: {
        CourseMaterial: true
      }
    });
  }

  async getModules(courseId: string, instructorId: string) {
    // Verify course ownership
    const course = await this.prisma.course.findUnique({
      where: { id: courseId }
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    if (course.instructorId !== instructorId) {
      throw new ForbiddenException('You can only view modules for your own courses');
    }

    return this.prisma.courseModule.findMany({
      where: { courseId },
      include: {
        CourseMaterial: {
          orderBy: { order: 'asc' }
        }
      },
      orderBy: { order: 'asc' }
    });
  }

  async updateModule(moduleId: string, instructorId: string, data: UpdateModuleDto) {
    // Verify module ownership through course
    const module = await this.prisma.courseModule.findUnique({
      where: { id: moduleId },
      include: { Course: true }
    });

    if (!module) {
      throw new NotFoundException('Module not found');
    }

    if (module.Course.instructorId !== instructorId) {
      throw new ForbiddenException('You can only update your own course modules');
    }

    return this.prisma.courseModule.update({
      where: { id: moduleId },
      data,
      include: {
        CourseMaterial: true
      }
    });
  }

  async deleteModule(moduleId: string, instructorId: string) {
    // Verify module ownership through course
    const module = await this.prisma.courseModule.findUnique({
      where: { id: moduleId },
      include: { Course: true }
    });

    if (!module) {
      throw new NotFoundException('Module not found');
    }

    if (module.Course.instructorId !== instructorId) {
      throw new ForbiddenException('You can only delete your own course modules');
    }

    await this.prisma.courseModule.delete({
      where: { id: moduleId }
    });

    return { message: 'Module deleted successfully' };
  }

  // ============ MATERIAL OPERATIONS ============

  async createMaterial(courseId: string, instructorId: string, data: CreateMaterialDto) {
    // Verify course ownership
    const course = await this.prisma.course.findUnique({
      where: { id: courseId }
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    if (course.instructorId !== instructorId) {
      throw new ForbiddenException('You can only create materials for your own courses');
    }

    // If moduleId is provided, verify it belongs to this course
    if (data.moduleId) {
      const module = await this.prisma.courseModule.findUnique({
        where: { id: data.moduleId }
      });

      if (!module || module.courseId !== courseId) {
        throw new NotFoundException('Module not found in this course');
      }
    }

    return this.prisma.courseMaterial.create({
      data: {
        courseId,
        moduleId: data.moduleId,
        title: data.title,
        description: data.description,
        type: data.type,
        fileUrl: data.fileUrl,
        content: data.content,
        order: data.order
      }
    });
  }

  async getMaterials(courseId: string, instructorId: string) {
    // Verify course ownership
    const course = await this.prisma.course.findUnique({
      where: { id: courseId }
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    if (course.instructorId !== instructorId) {
      throw new ForbiddenException('You can only view materials for your own courses');
    }

    return this.prisma.courseMaterial.findMany({
      where: { courseId },
      include: {
        Module: {
          select: {
            id: true,
            title: true
          }
        }
      },
      orderBy: { order: 'asc' }
    });
  }

  async updateMaterial(materialId: string, instructorId: string, data: UpdateMaterialDto) {
    // Verify material ownership through course
    const material = await this.prisma.courseMaterial.findUnique({
      where: { id: materialId },
      include: { Course: true }
    });

    if (!material) {
      throw new NotFoundException('Material not found');
    }

    if (material.Course.instructorId !== instructorId) {
      throw new ForbiddenException('You can only update your own course materials');
    }

    return this.prisma.courseMaterial.update({
      where: { id: materialId },
      data
    });
  }

  async deleteMaterial(materialId: string, instructorId: string) {
    // Verify material ownership through course
    const material = await this.prisma.courseMaterial.findUnique({
      where: { id: materialId },
      include: { Course: true }
    });

    if (!material) {
      throw new NotFoundException('Material not found');
    }

    if (material.Course.instructorId !== instructorId) {
      throw new ForbiddenException('You can only delete your own course materials');
    }

    await this.prisma.courseMaterial.delete({
      where: { id: materialId }
    });

    return { message: 'Material deleted successfully' };
  }
}

export type { CreateModuleDto, UpdateModuleDto, CreateMaterialDto, UpdateMaterialDto };
