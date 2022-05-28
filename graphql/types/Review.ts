import {
  extendType,
  idArg,
  intArg,
  nonNull,
  objectType,
  stringArg,
} from "nexus";

export const Review = objectType({
  name: "Review",
  definition(t) {
    t.nonNull.id("id");
    t.nonNull.int("rating");
    t.nonNull.string("body");
    t.nonNull.string("reviewer", {
      async resolve(parent, _, context) {
        const user = await context.prisma.user.findFirst({
          where: { reviews: { some: { id: parent.id } } },
        });
        return user!.name;
      },
    });
  },
});

export const reviewMutation = extendType({
  type: "Mutation",
  definition(t) {
    t.field("createReview", {
      type: "String",
      args: {
        id: nonNull(idArg()),
        rating: nonNull(intArg()),
        body: nonNull(stringArg()),
      },
      async resolve(_, args, context) {
        const userId = context.userId;
        if (!userId) {
          throw new Error("You Should Be Loged In!");
        }

        const alreadyReviewed = await context.prisma.review.findFirst({
          where: { AND: { userId, productId: args.id } },
        });

        if (alreadyReviewed) {
          throw new Error(
            "You've Already Leaved A Review On This Product! Tnx."
          );
        }

        try {
          await context.prisma.review.create({
            data: {
              rating: args.rating,
              body: args.body,
              productId: args.id,
              userId,
            },
          });
        } catch (e) {
          throw new Error("WOW How Did You Do That!!");
        }

        return "Done";
      },
    });
    t.field("deleteReview", {
      type: "String",
      args: {
        id: nonNull(idArg()),
      },
      async resolve(_, args, context) {
        const userId = context.userId;
        if (!userId) {
          throw new Error("You Should Be Loged In!");
        }

        const isReviewOwner = await context.prisma.review.findFirst({
          where: { AND: { userId, id: args.id } },
        });

        if (!isReviewOwner) {
          throw new Error("You're Not Allowed!");
        }

        await context.prisma.review.delete({ where: { id: args.id } });

        return "Done";
      },
    });
  },
});
