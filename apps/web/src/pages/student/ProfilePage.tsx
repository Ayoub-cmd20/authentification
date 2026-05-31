import { FormEvent, useEffect, useState } from "react";
import { api } from "../../api/client";
import { Button, Card, Field, Input } from "../../components/ui";
import type { StudentProfile } from "../../types";

const fields = [
  ["fullName", "Full name"],
  ["phone", "Phone number"],
  ["dateOfBirth", "Date of birth"],
  ["nationalId", "National ID number"],
  ["studentRegistrationNumber", "Student registration number"],
  ["university", "University"],
  ["faculty", "Faculty"],
  ["department", "Department"],
  ["specialty", "Specialty"],
  ["graduationYear", "Graduation year"],
  ["degreeType", "Degree type"]
];

export const ProfilePage = () => {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [saved, setSaved] = useState(false);
  useEffect(() => {
    api.get("/student/profile").then((response) => setProfile(response.data));
  }, []);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget).entries());
    const response = await api.put("/student/profile", data);
    setProfile(response.data);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (!profile) return <Card>Loading profile...</Card>;
  const values: Record<string, string | number | null | undefined> = {
    fullName: profile.user.fullName,
    phone: profile.user.phone,
    dateOfBirth: profile.dateOfBirth?.slice(0, 10),
    nationalId: profile.nationalId,
    studentRegistrationNumber: profile.studentRegistrationNumber,
    university: profile.university,
    faculty: profile.faculty,
    department: profile.department,
    specialty: profile.specialty,
    graduationYear: profile.graduationYear,
    degreeType: profile.degreeType
  };

  return (
    <Card>
      <h2 className="text-xl font-bold">Personal and academic information</h2>
      <form onSubmit={onSubmit} className="mt-6 grid gap-4 md:grid-cols-2">
        {fields.map(([name, label]) => (
          <Field key={name} label={label}>
            <Input
              name={name}
              type={name === "dateOfBirth" ? "date" : name === "graduationYear" ? "number" : "text"}
              defaultValue={values[name] ?? ""}
            />
          </Field>
        ))}
        <div className="md:col-span-2 flex items-center gap-4">
          <Button>Save profile</Button>
          {saved && <p className="text-sm font-semibold text-civic">Saved</p>}
        </div>
      </form>
    </Card>
  );
};
