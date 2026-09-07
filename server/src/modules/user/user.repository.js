import { UserModel } from "./user.model.js";
import { escapeRegex } from "../../utils/ids.js";

const withId = (user) => {
  if (!user) return user;
  const userObject = user.toObject ? user.toObject() : user;
  if (!userObject.id && userObject._id) {
    userObject.id = userObject._id.toString();
  }
  return userObject;
};

export const userRepository = {
  async findByEmail(email) {
    const user = await UserModel.findOne({
      email: String(email).trim().toLowerCase(),
    }).lean();
    return withId(user);
  },

  async findByUsername(username) {
    const user = await UserModel.findOne({
      username: String(username).trim().toLowerCase(),
    }).lean();
    return withId(user);
  },

  async findById(id) {
    const user = await UserModel.findById(id).lean();
    return withId(user);
  },

  async create(data) {
    const user = await UserModel.create(data);
    return withId(user);
  },

  async updateById(id, updates) {
    const user = await UserModel.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    }).lean();
    return withId(user);
  },

  async searchUsers(currentUserId, query = "") {
    const q = String(query).trim();
    if (q.length < 2) return [];

    const safe = escapeRegex(q);
    const users = await UserModel.find({
      _id: { $ne: currentUserId },
      $or: [
        { displayName: { $regex: safe, $options: "i" } },
        { username: { $regex: safe, $options: "i" } },
      ],
    })
      .sort({ displayName: 1 })
      .limit(20)
      .lean();

    return users.map(withId);
  },

  async getProfile(id) {
    const user = await UserModel.findById(id).lean();
    return withId(user);
  },
};
