import React, { useEffect } from "react";
import {
  Form,
  Input,
  Select,
  Button,
  DatePicker,
  Alert,
  notification,
} from "antd";
import useSWR from "swr";
import dayjs from "dayjs";
import { ActionResult } from "../../../../types/actions/action-result";
import { EmployeeWithRelations } from "@/lib/utils/prismaTypes/employeeWithRelations";
import fetchSWRContratos from "@/lib/actions/contrato/fetchSWRContracts";
import { fetchSWRCargos } from "@/lib/actions/funcionario/cargo/fetchSWRCargos";

import { z } from "zod";
import { EmployeeFormSchema } from "@/lib/utils/formSchemas/employeeFormSchema";
import { editFuncionario } from "@/lib/actions/funcionario/editFuncionario";
import { newFuncionario } from "@/lib/actions/funcionario/newFuncionario";

import { STATE } from "@/enums/states";

interface EmployeeFormProps {
  employee?: EmployeeWithRelations | null;
  onSuccess: () => void;
}

interface EmployeeFormValues {
  id?: number;
  name: string;
  cpf: string;
  rg: string;
  email: string;
  birthDate: dayjs.Dayjs;
  contact: string;
  admissionDate: dayjs.Dayjs;
  resingationDate?: dayjs.Dayjs | null;
  city: string;
  estate: string;
  cep: string;
  address: string;
  number: string;
  district: string;
  registration: number;
  contractId: number;
  roleId: number;
}

const FuncionarioForm: React.FC<EmployeeFormProps> = ({
  employee,
  onSuccess,
}) => {
  const [form] = Form.useForm<EmployeeFormValues>();
  const [loading, setLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>(null);

  // Fetchers
  const { data: contracts } = useSWR("contracts", fetchSWRContratos);
  const { data: roles } = useSWR("roles", fetchSWRCargos);

  useEffect(() => {
    if (employee) {
      form.setFieldsValue({
        ...employee,
        birthDate: employee.birthDate ? dayjs(employee.birthDate) : undefined,
        admissionDate: employee.admissionDate
          ? dayjs(employee.admissionDate)
          : undefined,
        resingationDate: employee.resingationDate
          ? dayjs(employee.resingationDate)
          : undefined,
        contractId: employee.contractId,
        roleId: employee.roleId,
      });
    }
  }, [employee, form]);

  const onFinish = async (values: EmployeeFormValues) => {
    setLoading(true);
    setError(null);

    try {
      // Validar os valores do formulário usando EmployeeFormSchema
      const validatedData = EmployeeFormSchema.parse(values);

      // Preparar dados para envio
      const data = new FormData();
      if (employee && employee.id) data.append("id", employee.id.toString());
      data.append("name", validatedData.name);
      data.append("cpf", validatedData.cpf);
      data.append("rg", validatedData.rg);
      data.append("email", validatedData.email);
      data.append("birthDate", validatedData.birthDate.toISOString());
      data.append("contact", validatedData.contact);
      data.append("admissionDate", validatedData.admissionDate.toISOString());
      if (validatedData.resingationDate)
        data.append(
          "resingationDate",
          validatedData.resingationDate.toISOString()
        );
      data.append("city", validatedData.city);
      data.append("estate", validatedData.estate);
      data.append("cep", validatedData.cep);
      data.append("address", validatedData.address);
      data.append("number", validatedData.number);
      data.append("district", validatedData.district);
      data.append("registration", validatedData.registration.toString());
      data.append("contractId", validatedData.contractId.toString());
      data.append("roleId", validatedData.roleId.toString());

      // Escolher a ação apropriada (novo ou editar)
      const action = employee ? editFuncionario : newFuncionario;

      const result: ActionResult = await action({ isValid: true }, data);

      if (result.success) {
        notification.success({ message: result.message });
        if (!employee) {
          form.resetFields();
        }
        onSuccess();
      } else {
        if (result.errors) {
          // Mapear erros para os campos correspondentes
          form.setFields(
            Object.entries(result.errors).map(([name, messages]) => ({
              name: name as keyof EmployeeFormValues,
              errors: messages,
            }))
          );
        }
        notification.error({ message: result.message });
      }
    } catch (err) {
      if (err instanceof z.ZodError) {
        // Mapear erros do Zod para os campos do formulário
        const zodErrors = err.flatten();
        form.setFields(
          Object.entries(zodErrors.fieldErrors).map(([name, messages]) => ({
            name: name as keyof EmployeeFormValues,
            errors: messages || [],
          }))
        );
      } else {
        console.error("Erro ao salvar o funcionário:", err);
        notification.error({
          message: "Ocorreu um erro ao salvar o funcionário.",
        });
        setError("Ocorreu um erro inesperado. Por favor, tente novamente.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
      initialValues={{
        name: "",
        cpf: "",
        rg: "",
        email: "",
        birthDate: undefined,
        contact: "",
        admissionDate: undefined,
        resingationDate: undefined,
        city: "",
        estate: "",
        cep: "",
        address: "",
        number: "",
        district: "",
        registration: undefined,
        contractId: undefined,
        roleId: undefined,
      }}
    >
      {employee && (
        <Form.Item name="id" hidden>
          <Input type="hidden" />
        </Form.Item>
      )}

      <Form.Item
        name="name"
        label="Nome"
        rules={[
          { required: true, message: "O nome do funcionário é obrigatório!" },
          { max: 100, message: "O nome não pode exceder 100 caracteres!" },
        ]}
      >
        <Input placeholder="Digite o nome" />
      </Form.Item>

      <Form.Item
        name="cpf"
        label="CPF"
        rules={[
          { required: true, message: "O CPF é obrigatório!" },
          {
            pattern: /^\d{11}$/,
            message: "O CPF deve conter exatamente 11 números!",
          },
        ]}
      >
        <Input placeholder="Digite o CPF (somente números)" />
      </Form.Item>

      <Form.Item
        name="rg"
        label="RG"
        rules={[{ required: true, message: "O RG é obrigatório!" }]}
      >
        <Input placeholder="Digite o RG (somente números)" />
      </Form.Item>

      <Form.Item
        name="email"
        label="Email"
        rules={[
          { required: true, message: "O email é obrigatório!" },
          { type: "email", message: "O email deve ser válido!" },
        ]}
      >
        <Input placeholder="Digite o email" />
      </Form.Item>

      <Form.Item
        name="birthDate"
        label="Data de Nascimento"
        rules={[
          { required: true, message: "A data de nascimento é obrigatória!" },
        ]}
      >
        <DatePicker format="DD/MM/YYYY" style={{ width: "100%" }} />
      </Form.Item>

      <Form.Item
        name="contact"
        label="Contato"
        rules={[{ required: true, message: "O contato é obrigatório!" }]}
      >
        <Input placeholder="Digite o contato" />
      </Form.Item>

      <Form.Item
        name="admissionDate"
        label="Data de Admissão"
        rules={[
          { required: true, message: "A data de admissão é obrigatória!" },
        ]}
      >
        <DatePicker format="DD/MM/YYYY" style={{ width: "100%" }} />
      </Form.Item>

      <Form.Item name="resingationDate" label="Data de Demissão">
        <DatePicker format="DD/MM/YYYY" style={{ width: "100%" }} />
      </Form.Item>

      <Form.Item
        name="city"
        label="Cidade"
        rules={[{ required: true, message: "A cidade é obrigatória!" }]}
      >
        <Input placeholder="Digite a cidade" />
      </Form.Item>

      <Form.Item
        name="estate"
        label="Estado"
        rules={[
          { required: true, message: "O estado é obrigatório!" },
          {
            pattern: /^[A-Z]{2}$/,
            message: "O estado deve conter exatamente 2 letras maiúsculas!",
          },
        ]}
      >
        <Select placeholder="Selecione o estado">
          {Object.entries(STATE).map(([key, value]) => (
            <Select.Option key={key} value={value}>
              {key}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item
        name="cep"
        label="CEP"
        rules={[
          { required: true, message: "O CEP é obrigatório!" },
          {
            pattern: /^\d{8}$/,
            message: "O CEP deve conter exatamente 8 números!",
          },
        ]}
      >
        <Input placeholder="Digite o CEP (somente números)" />
      </Form.Item>

      <Form.Item
        name="address"
        label="Endereço"
        rules={[{ required: true, message: "O endereço é obrigatório!" }]}
      >
        <Input placeholder="Digite o endereço" />
      </Form.Item>

      <Form.Item
        name="number"
        label="Número"
        rules={[{ required: true, message: "O número é obrigatório!" }]}
      >
        <Input placeholder="Digite o número do endereço" />
      </Form.Item>

      <Form.Item
        name="district"
        label="Bairro"
        rules={[{ required: true, message: "O bairro é obrigatório!" }]}
      >
        <Input placeholder="Digite o bairro" />
      </Form.Item>

      <Form.Item
        name="registration"
        label="Matrícula"
        rules={[{ required: true, message: "A matrícula é obrigatória!" }]}
      >
        <Input placeholder="Digite a matrícula" type="number" />
      </Form.Item>

      <Form.Item
        name="contractId"
        label="Contrato"
        rules={[{ required: true, message: "O contrato é obrigatório!" }]}
      >
        <Select placeholder="Selecione um contrato" loading={!contracts}>
          {contracts?.map((contract) => (
            <Select.Option key={contract.id} value={contract.id}>
              {contract.name}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item
        name="roleId"
        label="Cargo"
        rules={[{ required: true, message: "O cargo é obrigatório!" }]}
      >
        <Select placeholder="Selecione um cargo" loading={!roles}>
          {roles?.map((role) => (
            <Select.Option key={role.id} value={role.id}>
              {role.name}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>

      {error && (
        <Form.Item>
          <Alert
            type="error"
            message={error}
            showIcon
            closable
            onClose={() => setError(null)}
          />
        </Form.Item>
      )}

      <Form.Item>
        <Button type="primary" htmlType="submit" loading={loading}>
          {employee ? "Atualizar Funcionário" : "Adicionar Funcionário"}
        </Button>
      </Form.Item>
    </Form>
  );
};

export default FuncionarioForm;
