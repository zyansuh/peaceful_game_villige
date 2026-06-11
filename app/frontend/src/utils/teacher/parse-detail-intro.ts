export function parseDetailIntro(detailIntro: string): {
  gender: string;
  birthYear: string;
} {
  let gender = '';
  let birthYear = '';
  if (detailIntro) {
    const genderMatch = detailIntro.match(/성별:\s*([^\s|]+)/);
    const birthMatch = detailIntro.match(/출생년도:\s*([^\s|]+)/);
    if (genderMatch) gender = genderMatch[1];
    if (birthMatch) birthYear = birthMatch[1];
  }
  return { gender, birthYear };
}
