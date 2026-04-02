# Modelagem de Requisitos

## 1. O que são requisitos: 
Definem o que o sistema deve fazer e sob quais restrições ele deve operar. Divididos em duas categorias fundamentais:
* ### Requisitos funcionais: 
  * Estão relacionados com as ações práticas do sistema, ou seja, suas funcionalidades diretas (ex.: realizar uma transferência bancária, emitir um relatório)
* ### Requisitos não funcionais: 
  * Estão relacionados à qualidade do serviço e definem as restrições ao funcionamento do sistema (ex.: ter disponibilidade de 99,9%, tempo de resposta máximo de 1 segundo, portabilidade e segurança)

## 2. A engenharia de requisitos: 
Conjunto de atividades sistemáticas para descobrir (elicitar), analisar, especificar e manter os requisitos de software.
* ### Elicitação: 
  * É a fase investigativa onde interagimos com os stakeholders para entender suas necessidades. Pode ser feita por meio de entrevistas, questionários, workshops, uso de protótipos ou até mesmo etnografia (observação silenciosa do ambiente do cliente)
* ### Validação: 
  * Após levantados, os requisitos devem ser verificados para garantir que sejam corretos, precisos (sem ambiguidade), completos, consistentes e verificáveis.

## 3. Modelagem tradicional vs Modelagem Ágil: 
A forma como documentamos essas necessidades varia radicalmente dependendo da abordagem do projeto.
* ### Abordagem tradicional: 
  * Utiliza extensos documentos de especificação de requisitos (como o padrão IEEE 830). A principal ferramenta de modelagem aqui é o caso de uso. Ele detalha os passos que um ator realiza no sistema para atingir um objetivo, documentando o fluxo normal (o caminho feliz) e as extensões (situações alternativas ou erros).
* ### Abordagem ágil:
  * Descarta documentos pesados que logo se tornam obsoletos, substituindo-os por comunicação verbal frequente e forte colaboração com o cliente para maximizar o valor de negócio. A lista de necessidades vira um Product Backlog, que deve seguir o conceito DEEP: Detalhado apropriadamente, Estimado emergente (está sempre evoluindo) e Priorizado.

## 4. O coração da modelagem ágil - Histórias de Usuário:
Em projetos ágeis, utilizamos <b>User Stories</b> no lugar de longas especificações textuais. Elas são descrições simples de funcionalidades, escritas na perspectiva de quem vai usá-las.
* ### Estrutura básica:
  * "Como um [papel de usuário], eu quero/gostaria de [funcionalidades] para que [valor de negócio/objetivo]"
* ### O princípio dos 3 C's:
  * A história vive através do Cartão (o lembrete físico do requisito), da conversa (o diálogo contínuo da equipe com o representante do cliente) e da confirmação (os testes de aceitação objetivos que atestam que a história está pronta)
* ### Critérios de qualidade (INVEST):
  * Uma boa história de usuário deve ser Independente, Negociável, Valiosa, Estimável, Sucinta (pequena) e testável.
* ### Hierarquia: 
  * Requisitos muito grandes e complexos são chamados de Épicos. Como eles não cabem em uma única iteração, devem ser quebrados em funcionalidades e, finalmente, em histórias menores e acionáveis.

## 5. Técnicas de apoio para mapeamento:
Para evitar que a equipe perca a visão do todo ou esqueça o usuário final, utilizamos técnicas como:
* ### Personas:
  * Perfis semifictícios (com papéis, objetivos e necessidades) baseados nos clientes reais. Elas ajudam o time a focar as funcionalidades e aprimorar a tomada de decisão sobre o que é útil de verdade.
* ### Mapeamento de histórias (Story Mapping):
  * Uma ferramenta visual que organiza os requisitos (épicos e histórias) em um quadro, priorizando-os em eixos (o que fazem primeiro vs. depois). É excelente para organizar entregas e definir versões (releases) de forma estruturada.

## 6. Validando requisitos em Cenários de Incertezas:
Nem sempre o cliente sabe exatamente o que quer. Para evitar o desperdício de programar algo inútil, validamos hipóteses.
* ### Produto Mínimo Viável (MVP):
  * Técnica nascida no Lean Startup. Em vez de levantar todos os requisitos e fazer o software perfeito, construímos um produto com o mínimo de funcionalidades viáveis para testar uma ideia de negócios. Operamos no ciclo construir-medir-aprender.
* ### Testes A/B:
  * Uma técnica dirigida por dados (baseada em métricas de conversão) onde disponibilizamos duas versões idênticas de um sistema, exceto por uma mudança específica (requisito A vs. Requisito B). Usamos a versão que se sair melhor com os usuários reais, descartando os "achismos".
