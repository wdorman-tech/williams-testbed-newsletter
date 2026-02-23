const { requireAdmin } = require("../_lib/auth");

module.exports = async (req, res) => {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed." });
  }

  const auth = await requireAdmin(req, res);
  if (!auth) {
    return;
  }

  return res.status(200).json({
    cards: {
      topArticles: "Placeholder - tracking enabled later",
      users: "Placeholder - user analytics enabled later",
      revenue: "Placeholder - Stripe revenue metrics enabled later",
    },
  });
};
