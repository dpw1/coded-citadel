import './WorkTestimonialsSection.css'

const FACEBOOK_REVIEWS_URL = 'https://www.facebook.com/diegofortesdev/reviews'

const TESTIMONIALS = [
  {
    id: 'apey28',
    src: 'https://www.facebook.com/plugins/post.php?href=https%3A%2F%2Fwww.facebook.com%2Fapey28%2Fposts%2Fpfbid0215Whw5A2jyDv6eCKeyUs6J13j7dKuG5vzijv7bK51uR9t1X3m65a1w6frUS2fgJtl&show_text=true&width=500',
    height: 362,
  },
  {
    id: 'koray-uygun',
    src: 'https://www.facebook.com/plugins/post.php?href=https%3A%2F%2Fwww.facebook.com%2Fkoray.uygun.5%2Fposts%2Fpfbid08fJXxSNciWTazEJsQEkLKYBPhQnxvMftYDwzLPU6ScFCspCC27T2yYxW5McAv2oPl&show_text=true&width=500',
    height: 291,
  },
  {
    id: 'themackenziedodge',
    src: 'https://www.facebook.com/plugins/post.php?href=https%3A%2F%2Fwww.facebook.com%2Fthemackenziedodge%2Fposts%2Fpfbid0zSbkYa4CxExUX521i1P2RfnQt7VhapwRMmzw2VELi83djJgXSnNzacF4BDNgEfSml&show_text=true&width=500',
    height: 246,
  },
]

export default function WorkTestimonialsSection() {
  return (
    <section className="CC__work-testimonials" aria-label="Customer testimonials">
      <div className="CC__work-testimonials__header">
        <p className="CC__section-eyebrow">Testimonials</p>
        <h2 className="CC__section-title">What Clients Say About Me</h2>
        <p className="CC__work-testimonials__subtitle">
          Working as a senior Shopify dev since 2018. All reviews are verifiable.
        </p>
      </div>

      <div className="CC__work-testimonials__grid">
        {TESTIMONIALS.map((testimonial) => (
          <div key={testimonial.id} className="CC__work-testimonials__embed">
            <iframe
              src={testimonial.src}
              title={`Customer testimonial from ${testimonial.id}`}
              width="500"
              height={testimonial.height}
              style={{ border: 'none', overflow: 'hidden' }}
              scrolling="no"
              frameBorder="0"
              allowFullScreen
              allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
            />
          </div>
        ))}
      </div>

      <div className="CC__work-testimonials__actions">
        <a
          href={FACEBOOK_REVIEWS_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="CC__btn CC__btn--outline"
        >
          Read 20+ more testimonials here
        </a>
      </div>
    </section>
  )
}
