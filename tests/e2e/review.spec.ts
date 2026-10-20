import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { unzipSync, strFromU8 } from "fflate";
import { readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
const openIndustry = async (page: Page) => {
  await page.getByRole("link", { name: "Continuar", exact: true }).click();
};
const openRequirement = async (page: Page) => {
  await page
    .getByRole("button", { name: /^Identificação e documentos da unidade/ })
    .click();
};
const choose = async (page: Page, label: string, option: string) => {
  await page.getByRole("combobox", { name: label, exact: true }).click();
  await page.getByRole("option", { name: option, exact: true }).click();
};
const perspective = async (page: Page, id: string) => {
  const names: Record<string, string> = {
    technical: "Equipe técnica",
    reviewer: "Revisor independente",
    "client-industry": "Cliente · Indústria exemplo",
    "client-hospital": "Cliente · Hospital exemplo",
  };
  await choose(page, "Perspectiva de demonstração", names[id]);
};

test("request, correction, acceptance and actual dossier downloads", async ({
  page,
}, testInfo) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await openIndustry(page);
  await openRequirement(page);
  await page
    .getByRole("button", { name: "Solicitar à empresa", exact: true })
    .click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Salvar e continuar" })
    .click();
  await expect(
    page.getByRole("button", { name: /^Identificação e documentos/ }),
  ).toContainText("Aguardando empresa");
  await perspective(page, "client-industry");
  await openIndustry(page);
  await openRequirement(page);
  const content = Buffer.from(
    "EVIDENCIA FICTICIA\nUnidade exemplo, periodo de teste.\n",
  );
  await page
    .getByLabel("Anexar evidência sintética", { exact: false })
    .and(page.locator('input[type="file"]'))
    .setInputFiles({
      name: "evidencia.txt",
      mimeType: "text/plain",
      buffer: content,
    });
  await expect(
    page.getByRole("checkbox", { name: "evidencia.txt", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("checkbox", { name: "evidencia.txt", exact: true })
    .check();
  await page
    .getByLabel("Sua resposta", { exact: true })
    .fill("Primeiro envio fictício.");
  await page
    .getByRole("checkbox", { name: /Confirmo este envio fictício/ })
    .check();
  await page
    .getByRole("button", { name: "Enviar resposta demonstrativa" })
    .click();
  await perspective(page, "technical");
  await openIndustry(page);
  await openRequirement(page);
  await page
    .getByRole("button", { name: "Revisar resposta", exact: true })
    .click();
  await page
    .getByLabel("Justificativa / retorno", { exact: true })
    .fill("Esclareça o período no texto da resposta.");
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Salvar e continuar" })
    .click();
  await perspective(page, "client-industry");
  await openIndustry(page);
  await openRequirement(page);
  await page
    .getByRole("checkbox", { name: "evidencia.txt", exact: true })
    .check();
  await page
    .getByLabel("Sua resposta", { exact: true })
    .fill("Período do ensaio confirmado.");
  await page
    .getByRole("checkbox", { name: /Confirmo este envio fictício/ })
    .check();
  await page
    .getByRole("button", { name: "Enviar resposta demonstrativa" })
    .click();
  await perspective(page, "technical");
  await openIndustry(page);
  await openRequirement(page);
  await page
    .getByRole("button", { name: "Revisar resposta", exact: true })
    .click();
  await choose(page, "Resultado da revisão", "Conferir evidência do ensaio");
  await page
    .getByLabel("Justificativa / retorno", { exact: true })
    .fill("Evidência e período conferidos no ensaio.");
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Salvar e continuar" })
    .click();
  await expect(
    page.getByRole("button", { name: /^Identificação e documentos/ }),
  ).toContainText("Conferido");
  await page
    .getByRole("navigation", { name: "Seções do trabalho" })
    .getByRole("link", { name: "Entregáveis", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Criar versão de demonstração" })
    .click();
  await expect(
    page.getByRole("heading", { name: "Versão 1 · Intermediária" }),
  ).toBeVisible();
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Baixar dossiê ZIP" }).click();
  const download = await downloadPromise;
  const path = testInfo.outputPath("dossier-v1.zip");
  await download.saveAs(path);
  const entries = unzipSync(new Uint8Array(await readFile(path)));
  const manifest = JSON.parse(strFromU8(entries["04_Manifesto.json"]));
  expect(manifest.files).toHaveLength(1);
  expect(Buffer.from(entries[manifest.files[0].path])).toEqual(content);
  expect(manifest.files[0].sha256).toBe(
    createHash("sha256").update(content).digest("hex"),
  );
  await writeFile(
    testInfo.outputPath("report.pdf"),
    entries["01_Relatorio_de_entrega.pdf"],
  );
  await writeFile(
    testInfo.outputPath("matrix.xlsx"),
    entries["02_Matriz_e_indice.xlsx"],
  );
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({
    path: testInfo.outputPath("delivery.png"),
    fullPage: true,
  });
  await perspective(page, "client-hospital");
  await page.goto("/#trabalho/industry-job/entregaveis");
  await expect(
    page.getByRole("heading", { name: "Trabalho indisponível" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Baixar dossiê ZIP" }),
  ).toHaveCount(0);
  expect(errors).toEqual([]);
});

test("editable checklist, exclusion/restoration and browser persistence", async ({
  page,
}) => {
  await page.goto("/");
  await openIndustry(page);
  await openRequirement(page);
  await page
    .getByRole("button", { name: "Excluir do escopo", exact: true })
    .click();
  await page
    .getByLabel("Justificativa / retorno", { exact: true })
    .fill("Fora do escopo deste ensaio fictício.");
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Salvar e continuar" })
    .click();
  await expect(
    page.getByRole("button", { name: /^Identificação e documentos/ }),
  ).toHaveCount(0);
  await page.getByLabel("Mostrar itens fora do escopo").check();
  await openRequirement(page);
  await page.getByRole("button", { name: "Restaurar requisito" }).click();
  await page
    .getByRole("button", { name: "Editar requisito", exact: true })
    .click();
  await page
    .getByLabel("Título do requisito", { exact: true })
    .fill("Documento revisado do ensaio");
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Salvar e continuar" })
    .click();
  await page.reload();
  await expect(
    page.getByRole("button", { name: /^Documento revisado do ensaio/ }),
  ).toBeVisible();
});

test("new work setup exposes unsupported profiles instead of inventing obligations", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByRole("button", { name: "Novo trabalho", exact: true })
    .click();
  await choose(page, "Empresa", "Hospital exemplo");
  await page.getByLabel("Unidade", { exact: true }).fill("Unidade de teste");
  await choose(page, "Atividade efetiva", "Hospital");
  await page.getByLabel("Município", { exact: true }).fill("Município exemplo");
  await page.getByLabel("Período do trabalho", { exact: true }).fill("2026");
  await page
    .getByLabel("Serviço a entregar", { exact: true })
    .fill("Novo ensaio");
  await page.getByRole("button", { name: "Ver checklist sugerido" }).click();
  await expect(page.getByRole("dialog")).toContainText(
    "Esta combinação ainda não tem um perfil",
  );
  await page
    .getByRole("button", { name: "Criar trabalho de demonstração" })
    .click();
  await expect(
    page.getByRole("heading", { name: "Novo ensaio", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Checklist ainda não definido" }),
  ).toBeVisible();
});

test("keyboard dialog, two Forest appearances, mobile reflow and automated accessibility", async ({
  page,
}, testInfo) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Olá, equipe" }),
  ).toBeVisible();
  await page.screenshot({
    path: testInfo.outputPath("dashboard-dawn.png"),
    fullPage: true,
  });
  await page
    .getByRole("button", { name: "Novo trabalho", exact: true })
    .click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Novo trabalho", exact: true }),
  ).toBeFocused();
  const check = async () => {
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(
      results.violations.map((v) => ({
        id: v.id,
        nodes: v.nodes.map((n) => n.target),
      })),
    ).toEqual([]);
  };
  await check();
  await openIndustry(page);
  await openRequirement(page);
  await check();
  await page
    .getByRole("navigation", { name: "Seções do trabalho" })
    .getByRole("link", { name: "Entregáveis", exact: true })
    .click();
  await check();
  await page.emulateMedia({ colorScheme: "dark", reducedMotion: "reduce" });
  await page.goto("/");
  await check();
  await page.screenshot({
    path: testInfo.outputPath("dashboard-dusk.png"),
    fullPage: true,
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await check();
  await page.screenshot({
    path: testInfo.outputPath("dashboard-mobile.png"),
    fullPage: true,
  });
  await openIndustry(page);
  await openRequirement(page);
  await check();
  await page
    .getByRole("button", { name: "Solicitar à empresa", exact: true })
    .click();
  await check();
});

test("a damaged local draft is preserved and attention links open their exact requirement", async ({
  page,
}) => {
  await page.goto("/");
  await page.evaluate(() =>
    localStorage.setItem("ambientis-local-review-v1", "{damaged-draft"),
  );
  await page.reload();
  await expect(
    page.getByRole("alert").filter({ hasText: /rascunho/i }),
  ).toBeVisible();
  await page
    .getByRole("link", {
      name: /Solicitar evidência em falta.*Registros e evidências de resíduos/,
    })
    .click();
  await expect(
    page.locator("#requirement-detail").getByRole("heading", {
      name: "Registros e evidências de resíduos",
      exact: true,
    }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Solicitar à empresa", exact: true })
    .click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Salvar e continuar" })
    .click();
  expect(
    await page.evaluate(() =>
      localStorage.getItem("ambientis-local-review-v1"),
    ),
  ).toBe("{damaged-draft");
  await expect(
    page.getByText("Sem salvamento persistente · Demonstração"),
  ).toBeVisible();
});

test("returning home resets the previous screen's scroll position", async ({
  page,
}) => {
  await page.goto("/");
  await openIndustry(page);
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page
    .getByRole("navigation", { name: "Navegação principal" })
    .getByRole("link", { name: "Início", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Olá, equipe" }),
  ).toBeVisible();
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
  await expect(page.locator("html")).toHaveAttribute(
    "data-route-direction",
    "back",
  );
});

test("rounded menus preserve keyboard selection and Escape inside a dialog", async ({
  page,
}, testInfo) => {
  await page.goto("/");
  const perspective = page.getByRole("combobox", {
    name: "Perspectiva de demonstração",
  });
  await perspective.press("ArrowDown");
  await expect(
    page.getByRole("option", { name: "Equipe técnica", exact: true }),
  ).toBeFocused();
  await expect(page.getByRole("listbox")).toHaveCSS("border-radius", "24px");
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await page.screenshot({ path: testInfo.outputPath("rounded-menu.png") });
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("Enter");
  await expect(perspective).toContainText("Revisor independente");
  await choose(page, "Perspectiva de demonstração", "Equipe técnica");
  await page
    .getByRole("button", { name: "Novo trabalho", exact: true })
    .click();
  const company = page.getByRole("combobox", { name: "Empresa", exact: true });
  await company.click();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(company).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  const row = page.locator(".action-row").first();
  const restingSurface = await row.evaluate(
    (el) => getComputedStyle(el).backgroundColor,
  );
  await row.hover();
  await expect
    .poll(() => row.evaluate((el) => getComputedStyle(el).backgroundColor))
    .not.toBe(restingSurface);
  await expect(row).toHaveCSS("transition-duration", /0\.14s/);
  const navigation = page.getByRole("navigation", {
    name: "Navegação principal",
  });
  const home = navigation.getByRole("link", { name: "Início", exact: true });
  await expect(home).toHaveAttribute("aria-current", "page");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(row).toHaveCSS("transition-duration", "0s");
  await navigation.getByRole("link", { name: "Empresas", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Empresas", exact: true }),
  ).toBeVisible();
});

test("a company can have multiple contacts and scoped client perspectives", async ({
  page,
}, testInfo) => {
  await page.goto("/#empresas");
  await page.getByRole("button", { name: "Adicionar empresa" }).click();
  await page.getByLabel("CNPJ", { exact: true }).fill("12.ABC.345/01DE-35");
  await page
    .getByLabel("Nome da empresa ou contratante", { exact: true })
    .fill("Empresa fictícia de ensaio");
  await page.getByLabel("Nome do contato 1", { exact: true }).fill("Contato A");
  await page
    .getByLabel("Cargo do contato 1", { exact: true })
    .fill("Meio ambiente");
  await page
    .getByLabel("E-mail do contato 1", { exact: true })
    .fill("a@example.test");
  await page
    .getByLabel("WhatsApp do contato 1", { exact: true })
    .fill("+55 00 00000-0000");
  await page.getByRole("button", { name: "Adicionar outro contato" }).click();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await page.getByLabel("Nome do contato 2", { exact: true }).fill("Contato B");
  await page
    .getByLabel("E-mail do contato 2", { exact: true })
    .fill("b@example.test");
  await page.getByRole("button", { name: "Salvar empresa e contatos" }).click();
  await expect(
    page.getByRole("heading", {
      name: "Empresa fictícia de ensaio",
      exact: true,
    }),
  ).toBeVisible();
  await page.reload();
  const card = page.getByRole("article").filter({
    has: page.getByRole("heading", {
      name: "Empresa fictícia de ensaio",
      exact: true,
    }),
  });
  await expect(card).toContainText("a@example.test");
  await expect(card).toContainText("b@example.test");
  await page.screenshot({
    path: testInfo.outputPath("company-contacts.png"),
    fullPage: true,
  });
  await choose(
    page,
    "Perspectiva de demonstração",
    "Contato A · Empresa fictícia de ensaio",
  );
  await expect(
    page.getByRole("link", { name: /Indústria exemplo/ }),
  ).toHaveCount(0);
  await page.goto("/#trabalho/industry-job/requisitos");
  await expect(
    page.getByRole("heading", { name: "Trabalho indisponível" }),
  ).toBeVisible();
});

test("upload actions expose mobile gallery and camera and preserve a PNG original", async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/#trabalho/industry-job/documentos");
  await expect(
    page.getByRole("button", { name: "Selecionar arquivo", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Biblioteca de fotos", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Tirar foto", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByLabel("Capturar foto", { exact: true }),
  ).toHaveAttribute("capture", "environment");
  const png = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC1lEQVR42mP8/x8AAwMCAO+jcK0AAAAASUVORK5CYII=",
    "base64",
  );
  await page
    .getByLabel("Selecionar foto da biblioteca", { exact: true })
    .setInputFiles({
      name: "foto-ficticia.png",
      mimeType: "image/png",
      buffer: png,
    });
  await expect(
    page.getByRole("button", { name: "Baixar foto-ficticia.png" }),
  ).toBeVisible();
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Baixar foto-ficticia.png" }).click();
  const download = await downloadPromise;
  const file = testInfo.outputPath("photo.png");
  await download.saveAs(file);
  expect(await readFile(file)).toEqual(png);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({
    path: testInfo.outputPath("mobile-upload.png"),
    fullPage: true,
  });
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
    .analyze();
  expect(results.violations).toEqual([]);
});

test("the brand guide and board load portable assets on desktop and mobile", async ({
  page,
}, testInfo) => {
  await page.goto("/brand/index.html");
  await expect(
    page.getByRole("heading", {
      name: "Ambiente para um trabalho bem cuidado.",
    }),
  ).toBeVisible();
  await page.evaluate(() => document.fonts.ready);
  expect(
    await page
      .locator("img")
      .evaluateAll((images) =>
        images.every(
          (image) =>
            (image as HTMLImageElement).complete &&
            (image as HTMLImageElement).naturalWidth > 0,
        ),
      ),
  ).toBe(true);
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  const kitPromise = page.waitForEvent("download");
  await page
    .getByRole("link", { name: "Baixar kit da marca", exact: true })
    .click();
  const kit = await kitPromise;
  const kitPath = testInfo.outputPath("brand-kit.zip");
  await kit.saveAs(kitPath);
  const files = unzipSync(new Uint8Array(await readFile(kitPath)));
  expect(Object.keys(files).filter((name) => name.endsWith(".zip"))).toEqual(
    [],
  );
  expect(
    Object.keys(files).filter((name) => name.includes("/icons/")),
  ).toHaveLength(13);
  for (const name of [
    "index.html",
    "identity.json",
    "fonts/manrope-LICENSE.txt",
    "ambientis-logo-forest.svg",
    "ambientis-brand-board.png",
  ]) {
    expect(files[`ambientis-brand-kit/${name}`]?.length).toBeGreaterThan(0);
  }
  expect(
    strFromU8(files["ambientis-brand-kit/ambientis-logo-forest.svg"]),
  ).not.toContain("<text");
  await page.setViewportSize({ width: 390, height: 844 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: testInfo.outputPath("brand-guide-mobile.png"),
    fullPage: true,
  });
  await page.setViewportSize({ width: 1440, height: 1040 });
  await page.goto("/brand/ambientis-brand-board.html");
  await page.evaluate(() => document.fonts.ready);
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await page.screenshot({
    path: testInfo.outputPath("ambientis-brand-board.png"),
    fullPage: true,
  });
});

test("Dawn and Dusk override the system, persist, and remain usable on mobile", async ({
  page,
}, testInfo) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto("/");
  const light = () =>
    page.getByRole("button", {
      name: "Dusk: ativar modo claro (Dawn)",
      exact: true,
    });
  const dark = () =>
    page.getByRole("button", {
      name: "Dawn: ativar modo escuro (Dusk)",
      exact: true,
    });
  await expect(light()).toBeVisible();
  await expect(page.locator("html")).toHaveCSS("color-scheme", "dark");
  await light().focus();
  await page.keyboard.press("Enter");
  await expect(dark()).toBeFocused();
  await expect(page.locator("html")).toHaveCSS("color-scheme", "light");
  await expect(page.locator(".brand-dawn")).toBeVisible();
  await expect(page.locator(".brand-dusk")).not.toBeVisible();
  await page.reload();
  await expect(dark()).toBeVisible();
  await expect(page.locator("html")).toHaveCSS("color-scheme", "light");
  await dark().click();
  await page.emulateMedia({ colorScheme: "light" });
  await expect(page.locator("html")).toHaveCSS("color-scheme", "dark");
  await expect(page.locator(".brand-dusk")).toBeVisible();
  await page.evaluate(() =>
    Promise.all(
      document
        .getAnimations()
        .map((animation) => animation.finished.catch(() => undefined)),
    ),
  );
  await page.screenshot({
    path: testInfo.outputPath("appearance-dusk.png"),
    fullPage: true,
  });
  await page
    .getByRole("navigation", { name: "Navegação principal" })
    .getByRole("link", { name: "Empresas", exact: true })
    .click();
  await expect(light()).toBeVisible();
  for (const width of [390, 320]) {
    await page.setViewportSize({ width, height: 844 });
    await expect(light()).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    expect(
      (
        await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
          .analyze()
      ).violations,
    ).toEqual([]);
  }
  await light().click();
  await expect(page.locator("html")).toHaveCSS("color-scheme", "light");
  await page.evaluate(() =>
    Promise.all(
      document
        .getAnimations()
        .map((animation) => animation.finished.catch(() => undefined)),
    ),
  );
  await page.screenshot({
    path: testInfo.outputPath("appearance-mobile.png"),
    fullPage: true,
  });
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});

test("appearance still switches when preference storage is unavailable", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const original = Storage.prototype.setItem;
    Storage.prototype.setItem = function (key, value) {
      if (key === "ambientis-appearance")
        throw new DOMException("Unavailable", "QuotaExceededError");
      return original.call(this, key, value);
    };
  });
  await page.emulateMedia({ colorScheme: "light" });
  await page.goto("/");
  await page
    .getByRole("button", { name: "Dawn: ativar modo escuro (Dusk)" })
    .click();
  await expect(page.locator("html")).toHaveCSS("color-scheme", "dark");
  await page
    .getByRole("button", { name: "Dusk: ativar modo claro (Dawn)" })
    .click();
  await expect(page.locator("html")).toHaveCSS("color-scheme", "light");
});
