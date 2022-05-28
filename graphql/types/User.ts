import { extendType, objectType, list } from "nexus";

export const User = objectType({
  name: "User",
  definition(t) {
    t.nonNull.id("id");
    t.nonNull.string("email");
    t.nonNull.string("name");
    t.field("info", {
      type: "Info",
      async resolve(parent, __, context) {
        const info = await context.prisma.info.findFirst({
          where: { userId: parent.id },
        });
        return info;
      },
    });
    t.list.field("reviews", {
      type: "Review",
      async resolve(parent, _, context) {
        const reviews = await context.prisma.review.findMany({
          where: { userId: parent.id },
        });
        return reviews;
      },
    });
  },
});

export const Info = objectType({
  name: "Info",
  definition(t) {
    t.string("city");
    t.string("address");
    t.string("phonenumber");
    t.string("postalcode");
  },
});

export const userQuery = extendType({
  type: "Query",
  definition(t) {
    t.field("users", {
      type: list("User"),
      async resolve(_, __, context) {
        const users = await context.prisma.user.findMany();
        return users;
      },
    });
  },
});
