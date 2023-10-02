import express from "express";
import axios from "axios";
import _ from "lodash";

const app = express();
app.use(express.json());

let blogs = []; 

const fetchData = async () => {
    try {
        const response = await axios.get(
            "https://intent-kit-16.hasura.app/api/rest/blogs",
            {
                headers: {
                    "x-hasura-admin-secret":
                        "32qR4KmXOIpsGPQKMqEJHGJS27G5s7HdSKO3gdtQd2kv5e852SiYwWNfxkZOBuQ6",
                },
            }
        );

        blogs = response.data.blogs;
    } catch (error) {
        console.log("Error fetching data from the API:", error);
    }
};
const memorizeFetchData = _.memoize(fetchData, () => Date.now(), 18000);

fetchData().then(() => {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});

app.get("/api/blog-stats", (req, res) => {
  const totalBlogs = blogs.length;
  const longestBlog = _.maxBy(blogs, "title.length");
  const blogsWithPrivacy = _.filter(blogs, (blog) =>
    blog.title.toLowerCase().includes("privacy")
  );
  const uniqueTitles = _.uniqBy(blogs, "title");

  const statistics = {
    totalBlogs,
    longestBlog: longestBlog ? longestBlog.title : "",
    blogsWithPrivacy: blogsWithPrivacy.length,
    uniqueTitles: uniqueTitles.map((blog) => blog.title),
  };
  res.json(statistics);
});

app.get("/api/blog-search", (req, res) => {
  const query = req.query.query;
  if (!query) {
    return res.status(400).json({ error: "query parameter required" });
  }

  const filteredBlogs = _.filter(blogs, (blog) =>
    blog.title.toLowerCase().includes(query.toLowerCase())
  );

  res.json(filteredBlogs);
});

app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({ error: "An error occurred." });
});


