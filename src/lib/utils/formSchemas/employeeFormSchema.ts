import { z } from "zod";
import dayjs from "dayjs";

export const EmployeeFormSchema = z.object({
  name: z
    .string()
    .min(1, { message: "O nome do funcionário é obrigatório!" })
    .max(100, {
      message: "O nome do funcionário não pode exceder 100 caracteres!",
    }),
  cpf: z
    .string()
    .length(11, { message: "O CPF deve conter exatamente 11 caracteres!" })
    .regex(/^\d{11}$/, { message: "O CPF deve conter apenas números!" }),
  rg: z.string(),
  email: z.string().email({ message: "O e-mail deve ser válido!" }),
  birthDate: z.preprocess((arg) => {
    if (typeof arg === "string") {
      return dayjs(arg, "DD/MM/YYYY").toDate();
    }
    if (dayjs.isDayjs(arg)) return arg.toDate();
    return arg;
  }, z.date({ invalid_type_error: "A data de nascimento deve ser uma data válida!" })),
  contact: z.string().min(1, { message: "O contato é obrigatório!" }),
  admissionDate: z.preprocess((arg) => {
    if (typeof arg === "string") {
      return dayjs(arg, "DD/MM/YYYY").toDate();
    }
    if (dayjs.isDayjs(arg)) return arg.toDate();
    return arg;
  }, z.date({ invalid_type_error: "A data de admissão deve ser uma data válida!" })),
  resingationDate: z.preprocess((arg) => {
    if (arg === null || arg === undefined || arg === "") return null;
    if (typeof arg === "string") {
      return dayjs(arg, "DD/MM/YYYY").toDate();
    }
    if (dayjs.isDayjs(arg)) return arg.toDate();
    return arg;
  }, z.date().nullable().optional()),
  city: z.string().min(1, { message: "A cidade é obrigatória!" }),
  estate: z
    .string()
    .length(2, { message: "O estado deve conter exatamente 2 caracteres!" })
    .regex(/^[A-Z]{2}$/, {
      message: "O estado deve conter apenas letras maiúsculas!",
    }),
  cep: z
    .string()
    .length(8, { message: "O CEP deve conter exatamente 8 caracteres!" })
    .regex(/^\d{8}$/, { message: "O CEP deve conter apenas números!" }),
  address: z.string().min(1, { message: "O endereço é obrigatório!" }),
  number: z.string().min(1, { message: "O número do endereço é obrigatório!" }),
  district: z.string().min(1, { message: "O bairro é obrigatório!" }),
  registration: z.preprocess(
    (val) => Number(val),
    z
      .number({
        required_error: "O registro é obrigatório!",
        invalid_type_error: "O registro deve ser um número!",
      })
      .int()
      .positive({ message: "O registro deve ser um número positivo!" })
  ),
  contractId: z.preprocess(
    (val) => Number(val),
    z
      .number({
        required_error: "O contrato é obrigatório!",
        invalid_type_error: "O ID do contrato deve ser um número!",
      })
      .int()
      .positive({
        message: "O ID do contrato é obrigatório e deve ser um número válido!",
      })
  ),
  roleId: z.preprocess(
    (val) => Number(val),
    z
      .number({
        required_error: "O cargo é obrigatório!",
        invalid_type_error: "O ID do cargo deve ser um número!",
      })
      .int()
      .positive({
        message: "O ID do cargo é obrigatório e deve ser um número válido!",
      })
  ),
});
