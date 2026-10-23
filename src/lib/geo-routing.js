// ISO country codes from Vercel's edge geolocation; no third-party IP lookup.
export const COUNTRY_ROUTES = Object.freeze({US:'united-states',GB:'united-kingdom',AU:'australia',CA:'canada',FR:'france',DE:'germany',IE:'ireland',NL:'netherlands',BE:'belgium',ES:'spain',PT:'portugal',IT:'italy',AT:'austria',CH:'switzerland',SE:'sweden',NO:'norway',DK:'denmark',FI:'finland',IS:'iceland',PL:'poland',CZ:'czechia',SK:'slovakia',HU:'hungary',RO:'romania',BG:'bulgaria',GR:'greece',HR:'croatia',SI:'slovenia',EE:'estonia',LV:'latvia',LT:'lithuania',LU:'luxembourg',MT:'malta',CY:'cyprus',AL:'albania',BA:'bosnia-and-herzegovina',RS:'serbia',ME:'montenegro',MK:'north-macedonia',XK:'kosovo',MD:'moldova',UA:'ukraine',BY:'belarus',TR:'turkey',RU:'russia',AD:'andorra',LI:'liechtenstein',MC:'monaco',SM:'san-marino',VA:'vatican-city'});
export function countryDestination({pathname='/',country,seen=false,global=false,userAgent='',method='GET',prefetch=false}) {
  if(pathname!=='/' || !['GET','HEAD'].includes(method) || seen || global || prefetch || /bot|crawler|spider|slurp|facebookexternalhit|bingpreview/i.test(userAgent))return null;
  const slug=COUNTRY_ROUTES[String(country||'').toUpperCase()];
  return slug ? `/locations/${slug}` : null;
}
