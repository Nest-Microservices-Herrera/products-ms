import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaClient } from '@prisma/client';
import { PaginationDto } from 'src/common';

@Injectable()
export class ProductsService extends PrismaClient implements OnModuleInit {

  async onModuleInit() {
    await this.$connect();
  }

  create(createProductDto: CreateProductDto) {
    return this.product.create({
      data: createProductDto
    })
  }

  async findAll(paginationDto: PaginationDto) {
    const { page, limit } = paginationDto;
    const total = await this.product.count({ where: { available: true } });
    const lastPage = Math.ceil(total / limit)
    return {
      data: await this.product.findMany({
        take: +limit,
        skip: (+page - 1) * +limit,
        where: { available: true }
      }),
      meta: {
        total,
        page,
        lastPage
      }
    }

  }

  async findOne(id: number) {
    const product = await this.product.findFirst({ where: { id } })

    if (!product) {
      throw new NotFoundException(`Product with id #${id} not found`)
    }

    return product
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    const { id: ___, ...data } = updateProductDto;
    await this.findOne(id);

    return await this.product.update({
      where: { id },
      data
    })
  }

  async remove(id: number) {
    await this.findOne(id);
    return await this.product.delete({
      where: { id }
    })
  }

  async disable(id: number) {
    await this.findOne(id);
    const product = await this.product.update({
      where: { id },
      data: { available: false }
    })
  }
}
