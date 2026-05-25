export function normalizeCustomerName(name: string) {
  return name.trim().replace(/\s+/g, " ");
}

export function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("ja-JP", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

export function formatDate(value: string) {
  return new Intl.DateTimeFormat("ja-JP", {
    dateStyle: "medium"
  }).format(new Date(value));
}

export function formatGender(value: string) {
  const labels: Record<string, string> = {
    male: "男性",
    female: "女性",
    other: "その他",
    not_answered: "回答しない"
  };

  return labels[value] ?? "回答しない";
}

export function calculateAge(birthDate: string | null) {
  if (!birthDate) {
    return null;
  }

  const today = new Date();
  const birth = new Date(`${birthDate}T00:00:00`);
  let age = today.getFullYear() - birth.getFullYear();
  const hasBirthdayPassed =
    today.getMonth() > birth.getMonth() ||
    (today.getMonth() === birth.getMonth() && today.getDate() >= birth.getDate());

  if (!hasBirthdayPassed) {
    age -= 1;
  }

  return age >= 0 ? age : null;
}
