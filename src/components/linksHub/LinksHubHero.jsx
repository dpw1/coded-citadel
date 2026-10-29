export default function LinksHubHero({
  avatarSrc = '/avatar-citadel.jpg',
  title,
  description,
}) {
  return (
    <>
      <img
        className="CC__links-page__avatar"
        src={avatarSrc}
        alt=""
        width={88}
        height={88}
      />
      <h1 className="CC__links-page__title">{title}</h1>
      {description ? <p className="CC__links-page__desc">{description}</p> : null}
    </>
  )
}
