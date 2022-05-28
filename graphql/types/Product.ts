import {
  extendType,
  objectType,
  nonNull,
  stringArg,
  intArg,
  idArg,
} from "nexus";

import { cursorToOffset, connectionFromArraySlice } from "graphql-relay";

export const Product = objectType({
  name: "Product",
  definition(t) {
    t.nonNull.id("id");
    t.nonNull.string("name");
    t.nonNull.string("description");
    t.nonNull.int("price");
    t.nonNull.int("inStock");
    t.nonNull.string("imageUrl");
    t.int("sold", {
      // this is not the best way to get numbers of sold product, better to find another way.
      async resolve(parent, __, context) {
        const sold = await context.prisma.user.count({
          where: { boughtProducts: { some: { id: parent.id } } },
        });
        return sold;
      },
    });
    t.list.field("reviews", {
      type: "Review",
      async resolve(parent, _, context) {
        const reviews = await context.prisma.review.findMany({
          where: { productId: parent.id },
        });
        return reviews;
      },
    });
  },
});

// export const productQuery = extendType({
//   type: "Query",
//   definition(t) {
//     t.list.field("products", {
//       type: "Product",
//       async resolve(_, __, context) {
//         const products = await context.prisma.product.findMany();
//         return products;
//       },
//     });
//     t.field("product", {
//       type: "Product",
//       args: { id: nonNull(idArg()) },
//       async resolve(_, args, context) {
//         const product = await context.prisma.product.findUnique({
//           where: { id: args.id },
//         });
//
//         return product;
//       },
//     });
//   },
// });

export const ProductQuery = extendType({
  type: "Query",
  definition(t) {
    t.connectionField("products", {
      type: "Product",
      resolve: async (_, { after, first }, context) => {
        const offset = after ? cursorToOffset(after) + 1 : 0;
        if (isNaN(offset)) throw new Error("cursor is invalid");

        const [totalCount, items] = await Promise.all([
          context.prisma.product.count(),
          context.prisma.product.findMany({
            take: first,
            skip: offset,
          }),
        ]);

        return connectionFromArraySlice(
          items,
          { first, after },
          { sliceStart: offset, arrayLength: totalCount }
        );
      },
    });
    t.field("product", {
      type: "Product",
      args: { id: nonNull(idArg()) },
      async resolve(_, args, context) {
        const product = await context.prisma.product.findUnique({
          where: { id: args.id },
        });

        return product;
      },
    });
  },
});

export const productMutation = extendType({
  type: "Mutation",
  definition(t) {
    t.field("addProduct", {
      type: "Product",
      args: {
        name: nonNull(stringArg()),
        description: nonNull(stringArg()),
        price: nonNull(intArg()),
        inStock: nonNull(intArg()),
        imageUrl: nonNull(stringArg()),
      },
      async resolve(_, args, context) {
        if (context.role !== "admin") {
          throw new Error("Authorization Error!");
        }

        const product = await context.prisma.product.create({
          data: {
            ...args,
          },
        });
        return product;
      },
    });
    t.field("updateProduct", {
      type: "Product",
      args: {
        id: nonNull(idArg()),
        name: stringArg(),
        description: stringArg(),
        price: intArg(),
        inStock: intArg(),
        imageUrl: stringArg(),
      },
      async resolve(_, args, context) {
        const updatedProduct = await context.prisma.product.update({
          where: { id: args.id },
          data: {
            name: args.name!,
            description: args.description!,
            price: args.price!,
            inStock: args.inStock!,
            imageUrl: args.imageUrl!,
          },
        });
        return updatedProduct;
      },
    }),
      t.field("deleteProduct", {
        type: "String",
        args: {
          id: nonNull(idArg()),
        },
        async resolve(_, args, context) {
          try {
            await context.prisma.product.delete({ where: { id: args.id } });
          } catch (e) {
            return "No such product!";
          }
          return "Done";
        },
      });
  },
});
