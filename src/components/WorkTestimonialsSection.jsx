import './WorkTestimonialsSection.css'

const FACEBOOK_REVIEWS_URL = 'https://www.facebook.com/diegofortesdev/reviews'

const TESTIMONIALS = [
  {
    id: 'apey28',
    author: 'Aprylle Stuart',
    profileUrl: 'https://www.facebook.com/apey28',
    postUrl: 'https://www.facebook.com/apey28/posts/10160445787611147',
    avatarUrl:
      'https://scontent.fcgh8-1.fna.fbcdn.net/v/t39.30808-1/467450148_10161753857001147_1509123132654155757_n.jpg?stp=cp0_dst-jpg_s50x50_tt6&_nc_cat=101&ccb=1-7&_nc_sid=28885b&_nc_ohc=-MBZpkiss58Q7kNvwFXlq_a&_nc_oc=AdpzlJcvaiaPspcA-HcQ1hW_yptUm_wnnl8lddHn7w-FUmxEw0kyQyP-NcVps-Cb0k1tIhdvGcIuirxNtYXk3lzD&_nc_zt=24&_nc_ht=scontent.fcgh8-1.fna&edm=AN6CN6oEAAAA&_nc_gid=B3lYCU5iaWac2fYwBTg52Q&oh=00_AQA4YDTmALbYMI3SYs04DnEF2A_VvHpOEy4Cq2Zn1n05HQ&oe=6A608348',
    dateLabel: 'April 16, 2023',
    dateTitle: 'Sunday, April 16, 2023 at 11:23 AM',
    paragraphs: [
      'Diego at EZFY Dev was an absolute pleasure to work with! He changed my website over to the Dawn theme and did lots of customization, which I totally love! My website is now 5 times faster on Google\'s speed test thingy! He worked so fast!...and seemed to answer all my questions at any time of the day 24hrs!?...even though we are on different time zones. His emails always came with very clear explanations and recommendations, and in 100% perfect English. I recommend EZFY Dev 100% and can\'t wait to work with them again very soon on the 2nd phase of my website dev. (I worked with another Dev company last year and every step of the way was a total nightmare and a huge waste of my time and money.) Diego at EZFY was a dream to work with! I give 5 massive gold stars for Diego! ⭐️⭐️⭐️⭐️⭐️ Thank you so much! - I love my new website! 😍',
    ],
  },
  {
    id: 'koray-uygun',
    author: 'Koray Uygun',
    profileUrl: 'https://www.facebook.com/koray.uygun.5',
    postUrl: 'https://www.facebook.com/koray.uygun.5/posts/4110402362347553',
    avatarUrl:
      'https://scontent.fcgh8-1.fna.fbcdn.net/v/t39.30808-1/571228295_24745106041783883_5421738790377845182_n.jpg?stp=cp0_dst-jpg_s50x50_tt6&_nc_cat=105&ccb=1-7&_nc_sid=28885b&_nc_ohc=6xuJ7myF5FkQ7kNvwHryB_u&_nc_oc=Adq0IlGu--0wJHOc4xd1zP-koAQAYXnggJy2eLJWSKH0crbuuII5aTSKoM16UnKfSw4AnlxAEUvN5md_oKJjClr7&_nc_zt=24&_nc_ht=scontent.fcgh8-1.fna&edm=AN6CN6oEAAAA&_nc_gid=BLf_dlyFiuL6ZY0ycWokXQ&oh=00_AQANqhHiX2eTctElOn3J4fjvbAQqz0cD7kWJUqnWIel9uQ&oe=6A607473',
    dateLabel: 'August 5, 2021',
    dateTitle: 'Thursday, August 5, 2021 at 8:29 AM',
    paragraphs: [
      '100% Recommendation from Germany! 💪💪',
      'I was searching for an slider for my product page and reached out to the EZFY Team. They developed the slider very quickly and helped me to integrate it in my product page. Further I had some other bugs to fix on my Shop and they did it also in an very professional way. I am very satisfied because I got an very quick solution for my problem and the support Team responds very quickly. Our next project is waiting for the EZFY Team Thank you :)',
    ],
  },
  {
    id: 'themackenziedodge',
    author: 'Mackenzie Dodge',
    profileUrl: 'https://www.facebook.com/themackenziedodge',
    postUrl: 'https://www.facebook.com/themackenziedodge/posts/10217898828166682',
    avatarUrl:
      'https://scontent.fcgh8-1.fna.fbcdn.net/v/t39.30808-1/657441660_10232249073033835_4914358809764193045_n.jpg?stp=c5.62.500.500a_cp0_dst-jpg_s50x50_tt6&_nc_cat=107&ccb=1-7&_nc_sid=fe59b0&_nc_ohc=flgbUtVIj20Q7kNvwFT5zA6&_nc_oc=AdrRqCxPK34aV7KAQM1P24mOkqJPoH2C-QyAbCeLcwX2W_ty7FIncoEGOGWsaRmJXy0wWESZoJ4sUIXr8IR57e2K&_nc_zt=24&_nc_ht=scontent.fcgh8-1.fna&edm=AN6CN6oEAAAA&_nc_gid=odL2x_fO6bJr3JE065DMNw&oh=00_AQDqqI65EzUcqtJ3Ij5vBWAd6mmaOotLXKY0b3My5H3rFg&oe=6A607F1F',
    dateLabel: 'October 26, 2020',
    dateTitle: 'Monday, October 26, 2020 at 8:01 PM',
    paragraphs: [
      'Diego was so easy to work with, I literally had the code to fix the announcement banner on our shopify store in less than 15 minutes! From the time I messaged him on FB to the time I had the code with instructions in my email I barely had time to get coffee! Plus payment was affordable and easy! I wish I had the week back I tried to fix it myself. Will definitely message them FIRST in the future!',
    ],
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
          <article key={testimonial.id} className="CC__work-testimonial-card">
            <header className="CC__work-testimonial-card__header">
              <a
                href={testimonial.profileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="CC__work-testimonial-card__avatar-link"
                aria-label={testimonial.author}
              >
                <img
                  className="CC__work-testimonial-card__avatar"
                  src={testimonial.avatarUrl}
                  alt=""
                  width={40}
                  height={40}
                  loading="lazy"
                  decoding="async"
                />
              </a>
              <div className="CC__work-testimonial-card__meta">
                <a
                  href={testimonial.profileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="CC__work-testimonial-card__author"
                >
                  {testimonial.author}
                </a>
                <a
                  href={testimonial.postUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="CC__work-testimonial-card__date"
                  title={testimonial.dateTitle}
                >
                  {testimonial.dateLabel}
                </a>
              </div>
            </header>

            <div className="CC__work-testimonial-card__body">
              {testimonial.paragraphs.map((paragraph) => (
                <p key={paragraph.slice(0, 48)}>{paragraph}</p>
              ))}
            </div>

            <footer className="CC__work-testimonial-card__footer">
              <a
                href={testimonial.postUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="CC__work-testimonial-card__fb-link"
              >
                View on Facebook
              </a>
            </footer>
          </article>
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
