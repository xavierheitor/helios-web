import { z } from "zod";

export const VehicleFormSchema = z.object({
  plate: z
    .string()
    .min(1, { message: "A placa do veículo é obrigatória!" })
    .max(7, { message: "A placa deve ter no máximo 7 caracteres!" }),
  brand: z.string().min(1, { message: "A marca do veículo é obrigatória!" }),
  model: z.string().min(1, { message: "O modelo do veículo é obrigatório!" }),
  year: z.preprocess(
    (val) => Number(val),
    z
      .number({
        required_error: "O ano é obrigatório!",
        invalid_type_error: "O ano deve ser um número!",
      })
      .int()
  ),
  color: z.string().min(1, { message: "A cor do veículo é obrigatória!" }),
  operationalNumber: z
    .string()
    .min(1, { message: "O número operacional é obrigatório!" }),

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
  vehicleTypeId: z.preprocess(
    (val) => Number(val),
    z
      .number({
        required_error: "O tipo de veículo é obrigatório!",
        invalid_type_error: "O ID do tipo de veículo deve ser um número!",
      })
      .int()
      .positive({
        message:
          "O ID do tipo de veículo é obrigatório e deve ser um número válido!",
      })
  ),
});
