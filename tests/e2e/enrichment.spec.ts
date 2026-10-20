import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
const choose = async (page: Page, label: string, option: string) => {
  await page.getByRole("combobox", { name: label, exact: true }).click();
  await page.getByRole("option", { name: option, exact: true }).click();
};
const state = (page: Page) =>
  page.evaluate(() =>
    JSON.parse(localStorage.getItem("ambientis-local-review-v1")!),
  );
const axe = async (page: Page) =>
  expect(
    (
      await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
        .analyze()
    ).violations,
  ).toEqual([]);

test("public registry suggestions require review and preserve editable company fields", async ({
  page,
}, info) => {
  let calls = 0;
  await page.route("https://brasilapi.com.br/api/cnpj/v1/*", async (route) => {
    calls++;
    await route.fulfill({
      json: {
        cnpj: "12345678000195",
        razao_social: "Empresa de consulta fictícia",
        cnae_fiscal: 2014200,
        cnae_fiscal_descricao: "Gases de demonstração",
        cnaes_secundarios: [
          { codigo: 1234567, descricao: "Atividade secundária fictícia" },
        ],
        cep: "74000000",
        logradouro: "Rua teste",
        numero: "12",
        bairro: "Centro",
        municipio: "GOIANIA",
        uf: "GO",
        email: "DO-NOT-IMPORT@example.test",
        qsa: [{ nome_socio: "DO NOT IMPORT" }],
      },
    });
  });
  await page.route("https://brasilapi.com.br/api/cep/v2/*", (route) =>
    route.fulfill({
      json: {
        cep: "70040010",
        state: "DF",
        city: "BRASILIA",
        street: "Via fictícia",
        neighborhood: "Centro",
      },
    }),
  );
  await page.goto("/#empresas");
  await page.getByRole("button", { name: "Adicionar empresa" }).click();
  await page
    .getByLabel("Nome da empresa ou contratante", { exact: true })
    .fill("Nome manual preservado");
  await page.getByLabel("CNPJ", { exact: true }).fill("invalid");
  await page
    .getByRole("button", { name: "Consultar CNPJ na BrasilAPI" })
    .click();
  await expect(
    page.getByRole("alert").filter({ hasText: /CNPJ válido/ }),
  ).toBeVisible();
  expect(calls).toBe(0);
  await page.getByLabel("CNPJ", { exact: true }).fill("12.345.678/0001-95");
  await page
    .getByRole("button", { name: "Consultar CNPJ na BrasilAPI" })
    .click();
  await expect(
    page.getByRole("region", { name: "Resultado da consulta CNPJ" }),
  ).toBeVisible();
  await expect(
    page.getByLabel("Nome da empresa ou contratante", { exact: true }),
  ).toHaveValue("Nome manual preservado");
  await expect(page.getByText("DO NOT IMPORT", { exact: true })).toHaveCount(0);
  await page
    .getByRole("button", { name: "Aplicar dados públicos conferidos" })
    .click();
  await expect(page.getByLabel("CNAE principal", { exact: true })).toHaveValue(
    "2014200",
  );
  await choose(page, "Setor / ramo", "Gases industriais");
  await page
    .getByText("Endereço cadastral e CNAEs secundários", { exact: true })
    .click();
  await page.getByLabel("CEP da empresa", { exact: true }).fill("70040-010");
  await page
    .getByRole("button", { name: "Consultar CEP na BrasilAPI" })
    .click();
  await expect(
    page.getByLabel("Município cadastral", { exact: true }),
  ).toHaveValue("GOIANIA");
  await page
    .getByRole("button", { name: "Aplicar endereço conferido" })
    .click();
  await expect(
    page.getByLabel("Município cadastral", { exact: true }),
  ).toHaveValue("BRASILIA");
  await page
    .getByLabel("Nome do contato 1", { exact: true })
    .fill("Contato fictício");
  await page
    .getByLabel("E-mail do contato 1", { exact: true })
    .fill("teste@example.test");
  await axe(page);
  await page.screenshot({
    path: info.outputPath("registry-form.png"),
    fullPage: true,
  });
  await page.getByRole("button", { name: "Salvar empresa e contatos" }).click();
  await expect(
    page.getByRole("heading", {
      name: "Empresa de consulta fictícia",
      exact: true,
    }),
  ).toBeVisible();
  const saved = (await state(page)).companies.at(-1);
  expect(saved.registration).toMatchObject({
    cnpj: "12345678000195",
    sector: "gases",
    cnae: "2014200",
    city: "BRASILIA",
  });
  expect(saved.contacts[0].email).toBe("teste@example.test");
  expect(JSON.stringify(saved)).not.toContain("DO-NOT-IMPORT");
});

test("service and requirement choices work with locality lookup and manual API fallback", async ({
  page,
}, info) => {
  await page.route(
    "https://brasilapi.com.br/api/ibge/municipios/v1/GO",
    (route) =>
      route.fulfill({ json: [{ nome: "GOIANIA", codigo_ibge: "5208707" }] }),
  );
  await page.route("https://brasilapi.com.br/api/cep/v2/*", (route) =>
    route.fulfill({ status: 429, json: { message: "Rate limit" } }),
  );
  await page.goto("/");
  await page
    .getByRole("button", { name: "Novo trabalho", exact: true })
    .click();
  await page
    .getByLabel("Unidade", { exact: true })
    .fill("Unidade multiescolha");
  await page.getByLabel("Período do trabalho", { exact: true }).fill("2026");
  await page.getByRole("button", { name: "Buscar localidades de GO" }).click();
  await choose(page, "Escolher localidade consultada", "GOIANIA");
  await page.getByLabel("CEP da unidade", { exact: true }).fill("74000-000");
  await page
    .getByRole("button", { name: "Buscar endereço da unidade" })
    .click();
  await expect(
    page.getByRole("alert").filter({ hasText: /Limite/ }),
  ).toBeVisible();
  await expect(page.getByLabel("Município", { exact: true })).toHaveValue(
    "GOIANIA",
  );
  await page
    .getByRole("checkbox", { name: "Gestão de resíduos", exact: true })
    .check();
  await axe(page);
  await page.getByRole("button", { name: "Ver checklist sugerido" }).click();
  await page
    .getByRole("checkbox", { name: /Confirmar o uso de recursos hídricos/ })
    .uncheck();
  await page
    .getByRole("button", { name: "Criar trabalho de demonstração" })
    .click();
  await expect(
    page.getByRole("heading", {
      name: "Diagnóstico ambiental · Gestão de resíduos",
      exact: true,
    }),
  ).toBeVisible();
  const created = (await state(page)).jobs.at(-1);
  expect(created.services).toEqual([
    "Diagnóstico ambiental",
    "Gestão de resíduos",
  ]);
  expect(created.requirements).toHaveLength(3);
  expect(created.city).toBe("GOIANIA");
  await page
    .getByRole("button", { name: "Adicionar requisito", exact: true })
    .click();
  await page
    .getByRole("checkbox", { name: /Licenças e condicionantes/ })
    .check();
  await page.getByRole("checkbox", { name: /Escopo contratado/ }).check();
  await axe(page);
  await page.screenshot({
    path: info.outputPath("requirement-catalogue.png"),
    fullPage: true,
  });
  await page
    .getByRole("button", { name: "Adicionar selecionados (2)", exact: true })
    .click();
  expect((await state(page)).jobs.at(-1).requirements).toHaveLength(5);
});

test("technical staff renew a code and the invited contact creates a scoped local profile", async ({
  page,
}, info) => {
  await page.setViewportSize({ width: 530, height: 932 });
  await page.goto("/");
  await page
    .getByRole("button", { name: "Perfil da equipe", exact: true })
    .filter({ visible: true })
    .click();
  await page
    .getByRole("button", { name: "Gerenciar convites e renovar códigos" })
    .click();
  await page
    .getByRole("button", {
      name: "Gerar convite para Contato industrial fictício",
      exact: true,
    })
    .click();
  const original = await page
    .getByLabel("Código de convite para Contato industrial fictício", {
      exact: true,
    })
    .inputValue();
  await page
    .getByRole("button", {
      name: "Gerar novo código para Contato industrial fictício",
      exact: true,
    })
    .click();
  const renewed = await page
    .getByLabel("Código de convite para Contato industrial fictício", {
      exact: true,
    })
    .inputValue();
  expect(renewed).not.toBe(original);
  await page.goto(`/#convite/${original}`);
  await expect(
    page.getByRole("alert").filter({ hasText: /Convite/ }),
  ).toContainText("inválido");
  await page.goto(`/#convite/${renewed}`);
  await expect(
    page.getByLabel("E-mail convidado", { exact: true }),
  ).toHaveValue("industria@example.test");
  await page
    .getByLabel("Seu nome", { exact: true })
    .fill("Convidada de ensaio");
  await page.getByLabel("Seu cargo", { exact: true }).fill("Operações");
  await axe(page);
  await page.screenshot({
    path: info.outputPath("guest-profile.png"),
    fullPage: true,
  });
  await page
    .getByRole("button", { name: "Criar perfil e acompanhar empresa" })
    .click();
  await expect(
    page.getByRole("heading", {
      name: "Seu trabalho, acompanhado",
      exact: true,
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: /Hospital exemplo/ }),
  ).toHaveCount(0);
  await page.goto("/#trabalho/hospital-job/requisitos");
  await expect(
    page.getByRole("heading", { name: "Trabalho indisponível" }),
  ).toBeVisible();
  await page.goto(`/#convite/${renewed}`);
  await expect(
    page.getByRole("alert").filter({ hasText: /Convite/ }),
  ).toContainText("já utilizado");
});

test("delivery preview renders the preserved PDF and matrix without downloading", async ({
  page,
}, info) => {
  let downloads = 0;
  page.on("download", () => downloads++);
  await page.goto("/#trabalho/industry-job/entregaveis");
  await page
    .getByRole("button", { name: "Criar versão de demonstração" })
    .click();
  await page
    .getByRole("button", { name: "Visualizar dossiê", exact: true })
    .click();
  const dialog = page.getByRole("dialog");
  await expect(
    dialog.getByRole("heading", { name: "Visualizar dossiê · versão 1" }),
  ).toBeVisible();
  await expect(dialog).toContainText("Identificação e documentos da unidade");
  await dialog
    .getByRole("button", { name: "Relatório PDF", exact: true })
    .click();
  const reportPage = dialog.getByRole("img", {
    name: "Página 1 do relatório da versão 1",
    exact: true,
  });
  await expect(reportPage).toBeVisible();
  await expect(reportPage).toContainText(
    "Relatório de entrega e índice de evidências",
  );
  await dialog
    .getByRole("button", { name: "Relatório PDF", exact: true })
    .click();
  await expect(reportPage).toBeVisible();
  await dialog.getByRole("button", { name: "Matriz", exact: true }).click();
  await expect(dialog.getByRole("table")).toHaveCount(3);
  await expect(dialog.getByRole("table").first()).toContainText(
    "Identificação e documentos da unidade",
  );
  await page.setViewportSize({ width: 530, height: 932 });
  await axe(page);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: info.outputPath("delivery-preview.png"),
    fullPage: true,
  });
  expect(downloads).toBe(0);
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
  await page
    .getByRole("navigation", { name: "Seções do trabalho" })
    .getByRole("link", { name: "Requisitos", exact: true })
    .click();
  await page
    .getByRole("button", { name: /^Identificação e documentos da unidade/ })
    .click();
  await page
    .getByRole("button", { name: "Editar requisito", exact: true })
    .click();
  await page
    .getByLabel("Título do requisito", { exact: true })
    .fill("Alterado depois da entrega");
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Salvar e continuar" })
    .click();
  await page
    .getByRole("navigation", { name: "Seções do trabalho" })
    .getByRole("link", { name: "Entregáveis", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Visualizar dossiê", exact: true })
    .click();
  await expect(page.getByRole("dialog")).toContainText(
    "Identificação e documentos da unidade",
  );
  await expect(page.getByRole("dialog")).not.toContainText(
    "Alterado depois da entrega",
  );
});

test("the mobile navigation remains a visible fixed surface during page transitions", async ({
  page,
}, info) => {
  await page.setViewportSize({ width: 530, height: 932 });
  await page.goto("/");
  await expect(
    page.getByRole("combobox", { name: "Perspectiva de demonstração" }),
  ).toBeVisible();
  const navigation = page.getByRole("navigation", {
    name: "Navegação principal",
  });
  await navigation.getByRole("link", { name: "Empresas", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Empresas", exact: true }),
  ).toBeVisible();
  expect(
    await page
      .locator(".sidebar")
      .evaluate((element) => getComputedStyle(element).viewTransitionName),
  ).toBe("workspace-navigation");
  const opacity = await page.evaluate(
    () =>
      getComputedStyle(
        document.documentElement,
        "::view-transition-new(workspace-navigation)",
      ).opacity,
  );
  expect(opacity).toBe("1");
  await expect(
    navigation.getByRole("link", { name: "Início", exact: true }),
  ).toBeVisible();
  await page.screenshot({
    path: info.outputPath("mobile-navigation.png"),
    animations: "allow",
  });
  await navigation.getByRole("link", { name: "Início", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Olá, equipe" }),
  ).toBeVisible();
  await expect(navigation).toBeVisible();
});

test("changed identifiers discard stale lookup results and a CEP cannot silently change the job state", async ({
  page,
}) => {
  let release = () => {};
  const responseReady = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route("https://brasilapi.com.br/api/cnpj/v1/*", async (route) => {
    await responseReady;
    try {
      await route.fulfill({
        json: {
          cnpj: "12345678000195",
          razao_social: "Resultado antigo",
          cnae_fiscal: 2014200,
          cnae_fiscal_descricao: "Ensaio",
          municipio: "GOIANIA",
          uf: "GO",
        },
      });
    } catch (error) {
      if (!route.request().failure()?.errorText.includes("ERR_ABORTED"))
        throw error;
    }
  });
  await page.goto("/#empresas");
  await page.getByRole("button", { name: "Adicionar empresa" }).click();
  await page.getByLabel("CNPJ", { exact: true }).fill("12345678000195");
  await page
    .getByRole("button", { name: "Consultar CNPJ na BrasilAPI" })
    .click();
  await expect(
    page.getByRole("button", { name: "Consultando CNPJ…" }),
  ).toBeVisible();
  await page.getByLabel("CNPJ", { exact: true }).fill("12ABC34501DE35");
  release();
  await expect(
    page.getByRole("region", { name: "Resultado da consulta CNPJ" }),
  ).toHaveCount(0);
  await page
    .getByRole("button", { name: "Fechar janela", exact: true })
    .click();
  await page
    .getByRole("navigation", { name: "Navegação principal" })
    .getByRole("link", { name: "Início", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Olá, equipe", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Novo trabalho", exact: true })
    .click();
  await page.getByLabel("Município", { exact: true }).fill("Município manual");
  await page.route("https://brasilapi.com.br/api/cep/v2/*", (route) =>
    route.fulfill({
      json: {
        cep: "70040010",
        state: "DF",
        city: "BRASILIA",
        street: "Via de ensaio",
      },
    }),
  );
  await page.getByLabel("CEP da unidade", { exact: true }).fill("70040-010");
  await page
    .getByRole("button", { name: "Buscar endereço da unidade" })
    .click();
  await expect(
    page.getByRole("alert").filter({ hasText: /CEP pertence a DF/ }),
  ).toBeVisible();
  await expect(page.getByLabel("Município", { exact: true })).toHaveValue(
    "Município manual",
  );
  await expect(
    page.getByRole("button", {
      name: "Aplicar endereço da unidade",
      exact: true,
    }),
  ).toHaveCount(0);
});
