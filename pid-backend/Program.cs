// ═════════════════════════════════════════════════════════════════════════════
//  PID.Api — Program.cs
//  Plataforma Interativa de Descarbonização · Backend Motor de Dados
//  .NET 9 · ASP.NET Core Minimal API
// ═════════════════════════════════════════════════════════════════════════════

// Microsoft.OpenApi v2 (usado pelo Swashbuckle v10) moveu OpenApiInfo/OpenApiContact
// de Microsoft.OpenApi.Models para o namespace raiz Microsoft.OpenApi
using Microsoft.OpenApi;



var builder = WebApplication.CreateBuilder(args);

// ─── 1. Swagger / OpenAPI ─────────────────────────────────────────────────
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title       = "PID Copilot API",
        Version     = "v1",
        Description = "Motor de processamento de dados da Plataforma Interativa de " +
                      "Descarbonização. Fornece endpoints de infraestrutura energética, " +
                      "indústrias, hidrogênio e integração com ERPs corporativos (SAP/TOTVS).",
        Contact = new OpenApiContact
        {
            Name  = "Time PID · Hackathon 2026",
            Email = "pid-hackathon@example.com"
        }
    });
});

// ─── 2. CORS permissivo (dev/hackathon) ───────────────────────────────────
builder.Services.AddCors(options =>
{
    options.AddPolicy("PidCorsPolicy", policy =>
    {
        policy
            .AllowAnyOrigin()   // frontend em localhost:3000
            .AllowAnyMethod()   // GET, POST, OPTIONS …
            .AllowAnyHeader();
    });
});

var app = builder.Build();

// ─── 3. Middleware pipeline ───────────────────────────────────────────────
app.UseCors("PidCorsPolicy");

app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "PID Copilot API v1");
    c.RoutePrefix = string.Empty;          // Swagger na raiz: http://localhost:5000/
    c.DocumentTitle = "PID Copilot API";
});

// ═════════════════════════════════════════════════════════════════════════════
//  DADOS MOCKADOS — Em produção serão substituídos por chamadas aos
//  Feature Services do ArcGIS (ANEEL, EPE, IBGE) via HttpClient.
// ═════════════════════════════════════════════════════════════════════════════

// ── Dataset: Infraestrutura ───────────────────────────────────────────────
var infrastructureSummary = new
{
    Source            = "SIGEL-ANEEL / EPE WebMap",
    ReferenceYear     = 2024,
    UsinaHidreletrica = new { Count = 1_468,  CapacidadeMW = 109_058m, Unit = "MW" },
    EolicaESolar      = new { Count = 11_432,  CapacidadeMW = 48_320m,  Unit = "MW" },
    SistemasIsolados  = new { Count = 1_203,   CapacidadeMW = 6_812m,   Unit = "MW" },
    LinhasTransmissao = new { ExtensaoKm = 180_000, TensaoMaxKv = 765 },
    HubsDescarbonizacao = new[]
    {
        new { Nome = "Hub Amazônia",    Regiao = "Norte",   Status = "Planejado" },
        new { Nome = "Hub Nordeste",    Regiao = "Nordeste", Status = "Ativo"     },
        new { Nome = "Hub Sudeste",     Regiao = "Sudeste", Status = "Ativo"     },
        new { Nome = "Hub Sul Verde",   Regiao = "Sul",     Status = "Em Implantação" }
    }
};

// ── Dataset: Hidrogênio ───────────────────────────────────────────────────
var hydrogenHubs = new[]
{
    new {
        Id = 1, Nome = "H2V Pecém", Regiao = "Nordeste", Estado = "CE",
        Status = "Ativo", TipoFonte = "Eólica + Solar",
        CapacidadeKtAnual = 600m, ParceirosPrincipais = new[] { "Fortescue", "Neoenergia" }
    },
    new {
        Id = 2, Nome = "H2V Porto do Açu", Regiao = "Sudeste", Estado = "RJ",
        Status = "Ativo", TipoFonte = "Eólica Offshore",
        CapacidadeKtAnual = 400m, ParceirosPrincipais = new[] { "BP", "Prumo Logística" }
    },
    new {
        Id = 3, Nome = "H2V Suape", Regiao = "Nordeste", Estado = "PE",
        Status = "Planejado", TipoFonte = "Solar",
        CapacidadeKtAnual = 300m, ParceirosPrincipais = new[] { "Pernambuco Participações" }
    },
    new {
        Id = 4, Nome = "H2V Rio Grande", Regiao = "Sul", Estado = "RS",
        Status = "Em Estudo", TipoFonte = "Eólica Onshore",
        CapacidadeKtAnual = 250m, ParceirosPrincipais = new[] { "Petrobras", "ENGIE" }
    },
    new {
        Id = 5, Nome = "H2V Barcarena", Regiao = "Norte", Estado = "PA",
        Status = "Planejado", TipoFonte = "Biomassa + Hidro",
        CapacidadeKtAnual = 180m, ParceirosPrincipais = new[] { "Hydro Alunorte" }
    }
};

// ── Dataset: Indústrias (326 registros resumidos em representativos) ───────
var industries = new[]
{
    new { Id=1,  Nome="Ternium Brasil",              Setor="Aço",          Subsector="Aço Verde",   Estado="RJ", ConsumoMWh=850_000m,  PotencialDescarbonizacao="Alto"   },
    new { Id=2,  Nome="Usiminas",                    Setor="Aço",          Subsector="Aço BF BOF",  Estado="MG", ConsumoMWh=1_200_000m, PotencialDescarbonizacao="Alto"  },
    new { Id=3,  Nome="Gerdau Acominas",             Setor="Aço",          Subsector="Aço Verde",   Estado="MG", ConsumoMWh=920_000m,  PotencialDescarbonizacao="Alto"   },
    new { Id=4,  Nome="ArcelorMittal Brasil",        Setor="Aço",          Subsector="Aço BF BOF",  Estado="ES", ConsumoMWh=1_450_000m, PotencialDescarbonizacao="Médio" },
    new { Id=5,  Nome="CSN",                         Setor="Aço",          Subsector="Aço Verde",   Estado="RJ", ConsumoMWh=780_000m,  PotencialDescarbonizacao="Alto"   },
    new { Id=6,  Nome="Hydro Alunorte",              Setor="Aluminio",     Subsector="Primário",    Estado="PA", ConsumoMWh=2_100_000m, PotencialDescarbonizacao="Alto"  },
    new { Id=7,  Nome="Albras",                      Setor="Aluminio",     Subsector="Primário",    Estado="PA", ConsumoMWh=1_850_000m, PotencialDescarbonizacao="Alto"  },
    new { Id=8,  Nome="CBA – Aluminio",              Setor="Aluminio",     Subsector="Secundário",  Estado="SP", ConsumoMWh=1_600_000m, PotencialDescarbonizacao="Médio" },
    new { Id=9,  Nome="Novelis Brasil",              Setor="Aluminio",     Subsector="Reciclagem",  Estado="SP", ConsumoMWh=420_000m,  PotencialDescarbonizacao="Baixo"  },
    new { Id=10, Nome="Dow Brasil",                  Setor="Quimica",      Subsector="Petroquímica",Estado="SP", ConsumoMWh=1_100_000m, PotencialDescarbonizacao="Médio" },
    new { Id=11, Nome="Braskem",                     Setor="Quimica",      Subsector="Polímeros",   Estado="BA", ConsumoMWh=1_380_000m, PotencialDescarbonizacao="Médio" },
    new { Id=12, Nome="BASF Brasil",                 Setor="Quimica",      Subsector="Especialidades",Estado="SP",ConsumoMWh=310_000m, PotencialDescarbonizacao="Baixo" },
    new { Id=13, Nome="Votorantim Cimentos",         Setor="Cimenteira",   Subsector="Clínquer",    Estado="SP", ConsumoMWh=890_000m,  PotencialDescarbonizacao="Médio"  },
    new { Id=14, Nome="InterCement",                 Setor="Cimenteira",   Subsector="Clínquer",    Estado="SP", ConsumoMWh=720_000m,  PotencialDescarbonizacao="Médio"  },
    new { Id=15, Nome="Yara Brasil",                 Setor="Fertilizantes",Subsector="Nitrogênio",  Estado="RS", ConsumoMWh=480_000m,  PotencialDescarbonizacao="Alto"   },
    new { Id=16, Nome="Mosaic Fertilizantes",        Setor="Fertilizantes",Subsector="Fosfatados",  Estado="MG", ConsumoMWh=390_000m,  PotencialDescarbonizacao="Médio"  },
    new { Id=17, Nome="JBS Brasil",                  Setor="Alimenticia",  Subsector="Frigorífico", Estado="SP", ConsumoMWh=620_000m,  PotencialDescarbonizacao="Médio"  },
    new { Id=18, Nome="BRF",                         Setor="Alimenticia",  Subsector="Frigorífico", Estado="SC", ConsumoMWh=540_000m,  PotencialDescarbonizacao="Médio"  },
    new { Id=19, Nome="Ambev",                       Setor="Alimenticia",  Subsector="Bebidas",     Estado="SP", ConsumoMWh=410_000m,  PotencialDescarbonizacao="Baixo"  },
    new { Id=20, Nome="Guardian Glass Brasil",       Setor="Vidro",        Subsector="Plano",       Estado="SP", ConsumoMWh=280_000m,  PotencialDescarbonizacao="Médio"  },
    // (representação: os demais 306 registros seguem padrão idêntico)
};

// ── Regras de negócio para o score de viabilidade ERP ─────────────────────
static (int Score, string Recomendacao) CalculateViabilityScore(string region, string sector)
{
    // Tabela de pontuação base por região
    int regionScore = region.ToLowerInvariant() switch
    {
        "nordeste" => 35,   // Alta irradiação solar + eólica
        "norte"    => 30,   // Hidropotencial elevado + biomassa
        "sudeste"  => 28,   // Concentração industrial + logística
        "sul"      => 26,   // Eólica onshore + biomassa
        "centro-oeste" => 22,
        _          => 15
    };

    // Pontuação adicional por setor e aderência à descarbonização
    (int bonus, string rec) = sector.ToLowerInvariant() switch
    {
        "aço verde" or "aco verde" => (
            50,
            "Alta concentração de instalações siderúrgicas com potencial imediato de " +
            "migração para H₂ Verde e biomassa. ROI estimado em 8-12 anos."
        ),
        "aluminio" or "alumínio" => (
            45,
            "Setor com maior consumo energético do parque industrial (36% do total). " +
            "Migração para energia 100% renovável é tecnicamente viável e economicamente atrativa."
        ),
        "hidrogênio" or "hidrogenio" => (
            48,
            "Projeto alinhado à Política Nacional do Hidrogênio. Disponibilidade de " +
            "incentivos fiscais federais e linhas BNDES/BID."
        ),
        "quimica" or "química" => (
            38,
            "Potencial de substituição de nafta por etanol 2G e biometano. " +
            "Recomenda-se parceria com Braskem/Petrobras para cadeia circular."
        ),
        "cimenteira" => (
            32,
            "Uso de combustíveis alternativos (CDR) pode reduzir emissões em até 40%. " +
            "Carbono capturado (CCS) é a rota prioritária para descarbonização profunda."
        ),
        _ => (
            20,
            "Setor requer análise individualizada. Recomenda-se estudo de viabilidade " +
            "técnica com EPE e consulta ao Atlas da Eficiência Energética."
        )
    };

    int totalScore = Math.Min(regionScore + bonus, 100);

    string recommendation = $"{rec} Score final: {totalScore}/100 (Região: +{regionScore}, Setor: +{bonus}).";
    return (totalScore, recommendation);
}

// ═════════════════════════════════════════════════════════════════════════════
//  ENDPOINTS — Grupo /api
// ═════════════════════════════════════════════════════════════════════════════

var api = app.MapGroup("/api");

// ── GET /api/infrastructure ───────────────────────────────────────────────
api.MapGet("/infrastructure", () =>
{
    return Results.Ok(new
    {
        Success   = true,
        Timestamp = DateTime.UtcNow,
        Data      = infrastructureSummary
    });
})
.WithName("GetInfrastructure")
.WithSummary("Resumo da Infraestrutura Energética")
.WithDescription(
    "Retorna o panorama consolidado da infraestrutura do setor elétrico brasileiro: " +
    "usinas hidrelétricas, geração renovável (eólica/solar), sistemas isolados, " +
    "linhas de transmissão e Hubs de Descarbonização ativos. " +
    "Fonte: SIGEL-ANEEL, EPE WebMap."
)
.Produces<object>(StatusCodes.Status200OK);

// ── GET /api/hydrogen ─────────────────────────────────────────────────────
api.MapGet("/hydrogen", () =>
{
    return Results.Ok(new
    {
        Success      = true,
        Timestamp    = DateTime.UtcNow,
        TotalHubs    = hydrogenHubs.Length,
        AtivosCount  = hydrogenHubs.Count(h => h.Status == "Ativo"),
        Data         = hydrogenHubs
    });
})
.WithName("GetHydrogenHubs")
.WithSummary("HUBs de Hidrogênio Verde")
.WithDescription(
    "Lista todos os projetos de produção e infraestrutura de hidrogênio verde no Brasil, " +
    "com status (Ativo / Planejado / Em Estudo), capacidade e parceiros. " +
    "Fonte: IEA H₂ Projects Database, EPE Painel H₂."
)
.Produces<object>(StatusCodes.Status200OK);

// ── GET /api/industries[?sector=] ────────────────────────────────────────
api.MapGet("/industries", (string? sector) =>
{
    // LINQ: filtro opcional por setor (case-insensitive)
    var filtered = string.IsNullOrWhiteSpace(sector)
        ? industries
        : industries
            .Where(i =>
                i.Setor.Contains(sector, StringComparison.OrdinalIgnoreCase) ||
                i.Subsector.Contains(sector, StringComparison.OrdinalIgnoreCase))
            .ToArray();

    if (filtered.Length == 0)
        return Results.NotFound(new
        {
            Success = false,
            Message = $"Nenhuma indústria encontrada para o setor '{sector}'. " +
                      "Setores disponíveis: Aço, Aluminio, Quimica, Cimenteira, " +
                      "Fertilizantes, Alimenticia, Vidro, Aço Verde."
        });

    decimal totalConsumoMWh = string.IsNullOrWhiteSpace(sector)
        ? 30_400_000m   // Total real PID: 30,4M MWh (326 indústrias)
        : filtered.Sum(i => i.ConsumoMWh);

    return Results.Ok(new
    {
        Success             = true,
        Timestamp           = DateTime.UtcNow,
        FilterApplied       = sector,
        TotalIndustriesReal = string.IsNullOrWhiteSpace(sector) ? 326 : filtered.Length,
        TotalConsumoMWh     = totalConsumoMWh,
        TotalConsumoFormatted = $"{totalConsumoMWh / 1_000_000:F1}M MWh",
        Data                = filtered
    });
})
.WithName("GetIndustries")
.WithSummary("Lista de Indústrias com Filtro por Setor")
.WithDescription(
    "Retorna as indústrias cadastradas na PID. " +
    "Parâmetro opcional **?sector=** filtra por setor (ex: ?sector=Aluminio, ?sector=Aço Verde). " +
    "Sem filtro: retorna todas as 326 indústrias e consumo total de 30,4M MWh. " +
    "Fonte: IBGE, MapBiomas, EPE."
)
.Produces<object>(StatusCodes.Status200OK)
.Produces<object>(StatusCodes.Status404NotFound);

// ═════════════════════════════════════════════════════════════════════════════
//  ENDPOINT ERP — POST /api/erp/viability
// ═════════════════════════════════════════════════════════════════════════════

api.MapPost("/erp/viability", (ViabilityRequest request) =>
{
    // Validação básica do body
    if (string.IsNullOrWhiteSpace(request.Region))
        return Results.BadRequest(new { Success = false, Message = "Campo 'region' é obrigatório." });

    if (string.IsNullOrWhiteSpace(request.InvestmentSector))
        return Results.BadRequest(new { Success = false, Message = "Campo 'investmentSector' é obrigatório." });

    // Engine de cálculo de viabilidade (mock com regras de negócio reais)
    var (score, recommendation) = CalculateViabilityScore(request.Region, request.InvestmentSector);

    return Results.Ok(new
    {
        Success           = true,
        Timestamp         = DateTime.UtcNow,
        RequestId         = Guid.NewGuid().ToString("N")[..8].ToUpper(),
        // Campos padrão para integração ERP (SAP BAPI / TOTVS Fluig)
        ErpIntegration    = new
        {
            Source        = "PID Copilot API v1",
            Protocol      = "REST/JSON",
            ErpTargets    = new[] { "SAP S/4HANA", "TOTVS Protheus", "Oracle ERP Cloud" }
        },
        Input             = new { request.Region, request.InvestmentSector },
        Result            = new
        {
            Status         = score >= 80 ? "Aprovado" :
                             score >= 60 ? "Aprovado com Ressalvas" :
                             score >= 40 ? "Em Análise" : "Reprovado",
            Score          = score,
            MaxScore       = 100,
            ScoreLabel     = $"{score}/100",
            Recommendation = recommendation,
            // Próximos passos para o ERP
            NextSteps      = score >= 60
                ? new[]
                {
                    "Solicitar estudo de viabilidade técnica à EPE",
                    "Consultar linhas de financiamento BNDES Finem",
                    "Iniciar due diligence geoespacial no PID Copilot"
                }
                : new[]
                {
                    "Revisar premissas de investimento com equipe técnica",
                    "Consultar Atlas de Potencial Energético — MME",
                    "Agendar reunião com Hub de Descarbonização regional"
                }
        }
    });
})
.WithName("PostErpViability")
.WithSummary("Score de Prontidão para Integração ERP")
.WithDescription(
    "Endpoint projetado para consumo por ERPs corporativos (SAP S/4HANA, TOTVS Protheus). " +
    "Recebe região e setor de investimento e retorna um Score de Prontidão de Descarbonização " +
    "(0–100) com recomendações e próximos passos. " +
    "Regras baseadas em dados da EPE, ANEEL e IEA."
)
.Produces<object>(StatusCodes.Status200OK)
.Produces<object>(StatusCodes.Status400BadRequest);

// ─── Health check ─────────────────────────────────────────────────────────
app.MapGet("/health", () => Results.Ok(new
{
    Status    = "Healthy",
    Service   = "PID Copilot API",
    Version   = "1.0.0",
    Timestamp = DateTime.UtcNow,
    Endpoints = new[]
    {
        "GET  /api/infrastructure",
        "GET  /api/hydrogen",
        "GET  /api/industries[?sector=]",
        "POST /api/erp/viability"
    }
}))
.WithName("HealthCheck")
.WithSummary("Health Check da API")
.ExcludeFromDescription();   // Não aparece no Swagger (endpoint interno)

app.Run();

// ═════════════════════════════════════════════════════════════════════════════
//  RECORDS — Modelos de Request/Response (tipagem forte para o Swagger)
// ═════════════════════════════════════════════════════════════════════════════

/// <summary>
/// Payload de entrada para o endpoint de viabilidade ERP.
/// </summary>
/// <param name="Region">
/// Região geográfica do investimento (ex: "Sudeste", "Nordeste", "Norte", "Sul", "Centro-Oeste").
/// </param>
/// <param name="InvestmentSector">
/// Setor de investimento (ex: "Aço Verde", "Alumínio", "Hidrogênio", "Química", "Cimenteira").
/// </param>
record ViabilityRequest(string Region, string InvestmentSector);
