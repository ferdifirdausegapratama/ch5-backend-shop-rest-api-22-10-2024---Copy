const { Users } = require("../models");
const { Op } = require("sequelize");

const findUsers = async (req, res, next) => {
  try {
    // Mendapatkan parameter page dan limit dari query string
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // Membuat kondisi pencarian untuk Users
    const userConditions = {};
    if (req.query.name) {
      userConditions.name = { [Op.iLike]: `%${req.query.name}%` }; // Mencari berdasarkan nama
    }
    if (req.query.role) {
      userConditions.role = req.query.role; // Mencari berdasarkan role
    }
    // Tambahkan kondisi lain jika perlu

    // Mengambil data users dengan pagination dan conditions
    const users = await Users.findAndCountAll({
      where: userConditions,
      limit: limit,
      offset: offset,
    });

    res.status(200).json({
      status: "Success",
      message: "Success get users data",
      isSuccess: true,
      data: {
        totalItems: users.count,
        totalPages: Math.ceil(users.count / limit),
        currentPage: page,
        users: users.rows,
      },
    });
  } catch (error) {
    console.log(error.name);
    res.status(500).json({
      status: "Failed",
      message: error.message,
      isSuccess: false,
      data: null,
    });
  }
};

const findUserById = async (req, res, next) => {
  try {
    const user = await Users.findOne({
      where: {
        id: req.params.id,
      },
    });

    res.status(200).json({
      status: "Success",
      data: {
        user,
      },
    });
  } catch (err) {}
};

const updateUser = async (req, res, next) => {
  const { name, age, role, address, shopId } = req.body;
  try {
    await Users.update(
      {
        name,
        age,
        role,
        address,
        shopId,
      },
      {
        where: {
          id: req.params.id,
        },
      }
    );

    res.status(200).json({
      status: "Success",
      message: "sukses update user",
    });
  } catch (err) {}
};

const deleteUser = async (req, res, next) => {
  try {
    const user = await Users.findOne({
      where: {
        id: req.params.id,
      },
    });

    await Users.destroy({
      where: {
        id: req.params.id,
      },
    });

    res.status(200).json({
      status: "Success",
      message: "sukses delete user",
    });
  } catch (err) {}
};

module.exports = {
  findUsers,
  findUserById,
  updateUser,
  deleteUser,
};
