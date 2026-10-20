import { HonorPeopleManager } from "@/components/admin/HonorPeopleManager";
import { HONOR_CATEGORIES, listHonorPeople } from "@/lib/content/honor-people";

export const dynamic = "force-dynamic";

export default async function ComitivaPage() {
  let people: Awaited<ReturnType<typeof listHonorPeople>> = [];
  let error: string | null = null;
  try {
    people = await listHonorPeople();
  } catch {
    error = "Não foi possível carregar a comitiva. Tente de novo em instantes.";
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-semibold">Comitiva</h1>
        <p className="mt-2 text-olive/75">
          Padrinhos, convidados de honra e damas. A ordem da lista é a mesma do site.
        </p>
      </div>
      {error ? (
        <p className="text-sm text-red-700" role="alert">
          {error}
        </p>
      ) : (
        <HonorPeopleManager categories={HONOR_CATEGORIES} people={people} />
      )}
    </div>
  );
}
