const { Products, Shops } = require("../models");
const { Op } = require("sequelize");

const createProduct = async (req, res) => {
  const { name, stock, price, shopId } = req.body;

  try {
    const newProduct = await Products.create({
      name,
      stock,
      price,
      shopId,
    });

    res.status(201).json({
      status: "Success",
      message: "Success create new product",
      isSuccess: true,
      data: {
        newProduct,
      },
    });
  } catch (error) {
    console.log(error.name);
    if (error.name === "SequelizeValidationError") {
      const errorMessage = error.errors.map((err) => err.message);
      return res.status(400).json({
        status: "Failed",
        message: errorMessage[0],
        isSuccess: false,
        data: null,
      });
    } else if (error.name === "SequelizeDatabaseError") {
      return res.status(400).json({
        status: "Failed",
        message: error.message || "Database error",
        isSuccess: false,
        data: null,
      });
    } else {
      return res.status(500).json({
        status: "Failed",
        message: "An unexpected error occurred",
        isSuccess: false,
        data: null,
      });
    }
  }
};

const getAllProduct = async (req, res) => {
  try {
    const { productName, shopName, stock, minPrice, maxPrice } = req.query;

    // Mendapatkan parameter page dan limit dari query string
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // Membuat kondisi pencarian untuk Products
    const productConditions = {};
    if (productName) {
      productConditions.name = { [Op.iLike]: `%${productName}%` };
    }
    if (stock) {
      productConditions.stock = stock;
    }
    if (minPrice) {
      productConditions.price = { [Op.gte]: minPrice };
    }
    if (maxPrice) {
      productConditions.price = {
        ...productConditions.price,
        [Op.lte]: maxPrice,
      };
    }

    // Membuat kondisi pencarian untuk Shops
    const shopConditions = {};
    if (shopName) {
      shopConditions.name = { [Op.iLike]: `%${shopName}%` };
    }

    // Mengambil data products dengan pagination dan conditions
    const products = await Products.findAndCountAll({
      include: [
        {
          model: Shops,
          as: "shop",
          where: shopConditions,
        },
      ],
      where: productConditions,
      limit: limit,
      offset: offset,
    });

    res.status(200).json({
      status: "Success",
      message: "Success get products data",
      isSuccess: true,
      data: {
        totalItems: products.count,
        totalPages: Math.ceil(products.count / limit),
        currentPage: page,
        products: products.rows,
      },
    });
  } catch (error) {
    console.log(error.name);
    if (error.name === "SequelizeValidationError") {
      const errorMessage = error.errors.map((err) => err.message);
      return res.status(400).json({
        status: "Failed",
        message: errorMessage[0],
        isSuccess: false,
        data: null,
      });
    }

    res.status(500).json({
      status: "Failed",
      message: error.message,
      isSuccess: false,
      data: null,
    });
  }
};

const getProductById = async (req, res) => {
  const id = req.params.id;

  try {
    const product = await Products.findOne({
      where: {
        id,
      },
      include: [
        {
          model: Shops,
          as: "shop",
        },
      ],
    });

    res.status(200).json({
      status: "Success",
      message: "Success get product data",
      isSuccess: true,
      data: {
        product,
      },
    });
  } catch (error) {
    console.log(error.name);
    if (error.name === "SequelizeValidationError") {
      const errorMessage = error.errors.map((err) => err.message);
      return res.status(400).json({
        status: "Failed",
        message: errorMessage[0],
        isSuccess: false,
        data: null,
      });
    }

    res.status(500).json({
      status: "Failed",
      message: error.message,
      isSuccess: false,
      data: null,
    });
  }
};

const updateProduct = async (req, res) => {
  const id = req.params.id;
  const { name, stock, price } = req.body;

  try {
    const product = await Products.findOne({
      where: {
        id,
      },
    });

    if (!product) {
      res.status(404).json({
        status: "Failed",
        message: "Data not found",
        isSuccess: false,
        data: null,
      });
    }

    await Products.update({
      name,
      price,
      stock,
    });

    res.status(200).json({
      status: "Success",
      message: "Success update product",
      isSuccess: true,
      data: {
        product: {
          id,
          name,
          stock,
          price,
        },
      },
    });
  } catch (error) {
    console.log(error.name);
    if (error.name === "SequelizeValidationError") {
      const errorMessage = error.errors.map((err) => err.message);
      return res.status(400).json({
        status: "Failed",
        message: errorMessage[0],
        isSuccess: false,
        data: null,
      });
    }

    res.status(500).json({
      status: "Failed",
      message: error.message,
      isSuccess: false,
      data: null,
    });
  }
};

const deleteProduct = async (req, res) => {
  const id = req.params.id;

  try {
    const product = await Products.findOne({
      where: {
        id,
      },
    });

    if (!product) {
      res.status(404).json({
        status: "Failed",
        message: "Data not found",
        isSuccess: false,
        data: null,
      });
    }

    await Products.destroy();

    res.status(200).json({
      status: "Success",
      message: "Success delete product",
      isSuccess: true,
      data: null,
    });
  } catch (error) {
    console.log(error.name);
    if (error.name === "SequelizeValidationError") {
      const errorMessage = error.errors.map((err) => err.message);
      return res.status(400).json({
        status: "Failed",
        message: errorMessage[0],
        isSuccess: false,
        data: null,
      });
    }

    res.status(500).json({
      status: "Failed",
      message: error.message,
      isSuccess: false,
      data: null,
    });
  }
};

module.exports = {
  createProduct,
  getAllProduct,
  getProductById,
  updateProduct,
  deleteProduct,
};
