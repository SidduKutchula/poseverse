import mongoose from "mongoose";
import * as poseRepository from "../repositories/poseRepository.js";
import { POSES, CATEGORIES } from "../../client/src/data/poses.js";

const isDbConnected = () => mongoose.connection.readyState === 1;

export const getPosesFeed = async ({ categories, styles, lightings, difficulties, search, sort, page = 1, limit = 20 }) => {
  const pageNum = parseInt(page) || 1;
  const limitNum = parseInt(limit) || 20;

  if (!isDbConnected()) {
    let filtered = [...POSES];

    if (categories && categories.length > 0) {
      filtered = filtered.filter((p) => categories.includes(p.category));
    }
    if (styles && styles.length > 0) {
      filtered = filtered.filter((p) => styles.includes(p.style));
    }
    if (lightings && lightings.length > 0) {
      filtered = filtered.filter((p) => lightings.includes(p.lightingSuggestion));
    }
    if (difficulties && difficulties.length > 0) {
      filtered = filtered.filter((p) => difficulties.includes(p.difficulty));
    }
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    if (sort === "trending") {
      filtered.sort((a, b) => (b.trending ? 1 : 0) - (a.trending ? 1 : 0));
    } else if (sort === "difficulty_asc") {
      const diffOrder = { Beginner: 1, Easy: 2, Intermediate: 3, Pro: 4 };
      filtered.sort((a, b) => (diffOrder[a.difficulty] || 0) - (diffOrder[b.difficulty] || 0));
    } else if (sort === "difficulty_desc") {
      const diffOrder = { Beginner: 1, Easy: 2, Intermediate: 3, Pro: 4 };
      filtered.sort((a, b) => (diffOrder[b.difficulty] || 0) - (diffOrder[a.difficulty] || 0));
    }

    const total = filtered.length;
    const paginated = filtered.slice((pageNum - 1) * limitNum, pageNum * limitNum);

    return {
      poses: paginated,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum),
      },
    };
  }

  // MongoDB path
  const filter = {};
  if (categories && categories.length > 0) {
    filter.category = { $in: categories };
  }
  if (styles && styles.length > 0) {
    filter.style = { $in: styles };
  }
  if (lightings && lightings.length > 0) {
    filter.lightingSuggestion = { $in: lightings };
  }
  if (difficulties && difficulties.length > 0) {
    filter.difficulty = { $in: difficulties };
  }
  if (search) {
    const q = new RegExp(search, "i");
    filter.$or = [{ name: q }, { description: q }, { tags: { $in: [q] } }];
  }

  const sortOption = {};
  if (sort === "trending") {
    sortOption.trending = -1;
  }

  const total = await poseRepository.count(filter);
  const poses = await poseRepository.findAll({ filter, page: pageNum, limit: limitNum, sort: sortOption });

  return {
    poses,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      pages: Math.ceil(total / limitNum),
    },
  };
};

export const getPoseDetails = async (id) => {
  if (!isDbConnected()) {
    const pose = POSES.find((p) => p.id === id);
    if (!pose) {
      throw new Error("Pose not found");
    }
    return pose;
  }

  const pose = await poseRepository.findById(id);
  if (!pose) {
    throw new Error("Pose not found");
  }
  return pose;
};

export const getCategories = async () => {
  return CATEGORIES;
};
