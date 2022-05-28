import { objectType, extendType, nonNull, stringArg } from "nexus";
import { compare, hash } from "bcryptjs";
import { sign } from "jsonwebtoken";

const APPSECRET = process.env.APP_SECRET as string;

export const AuthPayload = objectType({
  name: "authPayload",
  definition(t) {
    t.nonNull.string("token");
    t.nonNull.field("user", {
      type: "User",
    });
  },
});

export const userMutation = extendType({
  type: "Mutation",
  definition(t) {
    t.field("logIn", {
      type: "authPayload",
      args: {
        email: nonNull(stringArg()),
        password: nonNull(stringArg()),
      },
      async resolve(_, args, context) {
        const user = await context.prisma.user.findUnique({
          where: { email: args.email },
        });

        if (!user) {
          throw new Error("Invalid Credentials!");
        }

        const password = await context.prisma.password.findUnique({
          where: { userId: user.id },
        });

        const valid = await compare(args.password, password!.hash);

        if (!valid) {
          throw new Error("Invalid Credentials");
        }

        const token = sign({ userId: user.id }, APPSECRET);

        return { token, user };
      },
    }),
      t.field("signUp", {
        type: "authPayload",
        args: {
          email: nonNull(stringArg()),
          name: nonNull(stringArg()),
          password: nonNull(stringArg()),
        },
        async resolve(_, args, context) {
          const hashedPassword = await hash(args.password, 10);
          const user = await context.prisma.user.create({
            data: {
              ...args,
              password: {
                create: {
                  hash: hashedPassword,
                },
              },
            },
          });

          const token = sign({ userId: user.id }, APPSECRET);

          return { token, user };
        },
      });
  },
});
