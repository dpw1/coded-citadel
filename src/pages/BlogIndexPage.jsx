import SiteHeader from '../components/SiteHeader'
import SiteFooter from '../components/SiteFooter'
import { BlogIndexSEO } from '../components/BlogPageSEO'
import BlogPostGrid from '../components/BlogPostGrid'
import { getAllBlogPosts } from '../utils/blog'
import '../App.css'
import './BlogPage.css'

export default function BlogIndexPage() {
  const posts = getAllBlogPosts()

  return (
    <>
      <BlogIndexSEO />
      <SiteHeader />
      <main className="CC__blog-page">
        <div className="CC__container CC__blog-page__inner">
          <header className="CC__blog-page__header">
            <p className="CC__section-eyebrow">Blog</p>
            <h1 className="CC__section-title">Build Logs &amp; Updates</h1>
            <p className="CC__blog-page__intro">
              Lessons from shipping Chrome extensions in public — metrics, mistakes, and more.
            </p>
          </header>

          {posts.length === 0 ? (
            <p className="CC__blog-page__empty">No posts yet. Check back soon.</p>
          ) : (
            <BlogPostGrid posts={posts} />
          )}
        </div>
      </main>
      <SiteFooter />
    </>
  )
}
