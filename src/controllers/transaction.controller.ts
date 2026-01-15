import { text, type Response } from "express";
import type { AuthenticatedRequest } from "../middleware/authenticateJWT";
import { userIdSchema } from "../zodSchemas/zodUserSchema";
import {
  createTransactionSchema,
  getTransactionSchema,
} from "../zodSchemas/zodTransactionSchema";
import { prisma } from "../db/prismaInstance";
import { Prisma } from "../../generated/prisma/client";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";

const createTransaction = async (req: AuthenticatedRequest, res: Response) => {
  const { userId } = userIdSchema.parse(req.user);
  const { amount, categoryName, description, type } =
    createTransactionSchema.parse(req.body);

  const transaction = await prisma.$transaction(async (item) => {
    const category = await item.category.upsert({
      where: {
        userId_categoryName_type: {
          userId,
          categoryName,
          type,
        },
      },
      update: {},
      create: {
        userId,
        categoryName,
        type,
      },
    });

    const createdTransAction = await item.transaction.create({
      data: {
        userId,
        amount: new Prisma.Decimal(amount),
        categoryId: category.id,
        description,
        type,
      },
    });
    return createdTransAction;
  });

  if (!transaction) {
    throw new ApiError(400, "transaction failed ");
  }

  res
    .status(201)
    .json(
      new ApiResponse(
        201,
        { ...transaction, amount: transaction.amount.toFixed(2) },
        "transaction Created Successfully"
      )
    );
};

const getTransaction = async (req: AuthenticatedRequest, res: Response) => {
  const { userId } = userIdSchema.parse(req.user);
  const { month, year, categoryName, type } = getTransactionSchema.parse(
    req.query
  );

  let dateFilter: Prisma.DateTimeFilter | undefined;

  if (year && !month) {
    const startDate = new Date(Number(year), 0, 1);
    const endDate = new Date(Number(year) + 1, 0, 1);

    dateFilter = {
      gte: startDate,
      lt: endDate,
    };
  }

  if (year && month) {
    const startDate = new Date(Number(year), Number(month) - 1, 1);
    const endDate = new Date(Number(year), Number(month), 1);

    dateFilter = {
      gte: startDate,
      lt: endDate,
    };
  }

  const transactions = await prisma.transaction.findMany({
    where: {
      userId,
      ...(type && { type }),
      ...(dateFilter && {
        createdAt: dateFilter,
      }),
      ...(categoryName && {
        category: {
          categoryName: {
            equals: categoryName,
            mode: "insensitive",
          },
        },
      }),
    },

    include: {
      category: {
        select: {
          categoryName: true,
          type: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  if (!transactions) {
    throw new ApiError(500, "unable to find transactions");
  } else if (transactions.length === 0) {
    return res
      .status(200)
      .json(new ApiResponse(200, null, "no transaction found"));
  }

  const data = transactions.map((tx) => ({
    ...tx,
    amount: tx.amount.toFixed(2),
  }));

  return res
    .status(200)
    .json(new ApiResponse(200, data, "transaction fetched successfully"));
};

export { createTransaction, getTransaction };
