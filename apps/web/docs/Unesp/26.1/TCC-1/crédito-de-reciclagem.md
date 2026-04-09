import Definicao from '@site/src/components/Definicao';
import { defMTR, defVerificador, defCCRLR } from './_termos.mdx';

# Sistema Pool de Crédito de Reciclagem

## Introdução

Cooperativas de triagem, em sua grande maioria, são entidades muito pobres que vivem unicamente da venda dos materiais reciclados. Atualmente existem também sistemas de compensação do lixo sólido descartado através do crédito de reciclagem, onde empresas geradoras de resíduos sólidos precisam reciclar 30% do lixo produzido.

Entidades gestoras fazem a auditoria das notas fiscais geradas pelas cooperativas e as transformam em créditos de reciclagem válidos. Acontece que o processo manual e demorado faz com que entidades gestoras priorizem cooperativas que reciclam grandes quantidades, já que precisam garantir a venda dos créditos para grandes players, deixando cooperativas menores fora desse sistema.

Solução: desenvolvimento de um pool de créditos no qual as cooperativas fazem o envio das notas fiscais no sistema que audita automaticamente. A partir de agora as entidades gestoras não precisam do processo complexo, elas coletam NFs já auditadas e transformadas em créditos. Quando uma empresa faz a compra, ela "coleta" diversas notas fiscais juntas para suprir sua necessidade e nesse meio estão NFs de cooperativas menores. Em teoria, faz a junção de várias notas menores em um grande certificado de crédito.
- Obs: Por mais que as grandes cooperativas tenham maior parte do lixo reciclável, esse sistema beneficia também pequenas cooperativas de acordo com seu volume de lixo reciclado, que já pode ser incluso como uma renda extra (mesmo processo de produção, porém com renda de créditos).

## Glossário

* <b>Catador de Materiais Recicláveis (Individual/MEI):</b> Profissional autônomo, na base da cadeia, responsável pela coleta, seleção e transporte primário dos materiais recicláveis.
*  <b>Cooperativas e Associações de Catadores (Operadores Logísticos):</b> São organizações formais que agregam os catadores e atuam como operadoras logísticas. Elas consolidam o volume do lixo reciclável e são as responsáveis originais por emitir a Nota Fiscal Eletrônica (NF-e) de venda do material físico.
*  <b>Empresas poluidoras (Destinador Final):</b> São as pessoas jurídicas que produzem ou inserem embalagens e produtos no mercado. Pelo princípio do poluidor-pagador da PNRS, elas têm a responsabilidade legal de comprovar a logística reversa (recuperação) do passivo que geraram.
*  <b>Indústria Recicladora (Destinador Final):</b> É a indústria que compra o resíduo físico das cooperativas e atravessadores para transformá-lo em matéria-prima. É o único ator capaz de emitir o Certificado de Destinação Final (CDF) dentro do sistema do governo (SINIR/SIGOR), atestando ambientalmente que o material foi processado e não foi para um aterro sanitário.
*  <b>Entidade Gestora:</b> É uma pessoa jurídica instituída para estruturar, implementar e gerenciar o sistema de logística reversa de forma coletiva, representando um conjunto de empresas e indústrias. Tem a competência legal de emitir oficialmente os certificados de crédito (CCRLR, CERE, CCMF). No sistema, ela atua no painel B2B buscando e comprando o lastro validado de notas para comprovar as metas das empresas que ela representa.
*  <b>Verificador de Resultado:</b> É uma pessoa jurídica de direito privado, totalmente independente e homologada pelo Ministério do Meio Ambiente. A função exclusiva desse verificador é receber os dados da NF-e e do CDF, validar eletronicamente na Receita Federal e atestar a "não colisão", ou seja, auditar para garantir que a mesma nota fiscal não está sendo usada duas vezes para gerar crédito duplicado. 


## Objetivo Principal

O objetivo principal do sistema é inserir outra forma de renda para a base da cadeia (cooperativas e catadores).

## Objetivos de Desenvolvimento Sustentável Cumpridos

Os [Objetivos de Desenvolvimento Susntentáveis (ODS)](./ods.md) da ONU sao métricas globais ideal para justificar o impacto de projetos tecnológicos voltados ao meio ambiente e a sociedade. 

O projeto atende diretamente esses 3 ODS principais:

<div style={{ display: 'flex', gap: '20px' }}>
  <img src="/img/SDG-8.svg" alt="SDG 8" style={{ width: '200px' }} />
  <img src="/img/SDG-11.svg" alt="SDG 11" style={{ width: '200px' }} />
  <img src="/img/SDG-12.svg" alt="SDG 12" style={{ width: '200px' }} />
</div>

## Fluxos do Sistema

1. Cooperativa acessa a plataforma para fazer o upload de um XML da nota fiscal do lixo que foi triado e vendido. Nessa etapa vai ser preciso captar algumas informações importantes como:
   - CNPJ da cooperativa
   - Número da Nota Fiscal
   - Tipo de Material
   - Pesagem do Material
2. A Nota Fiscal enviada pela cooperativa é armazenada no sistema e persiste com status de espera até que a indústria recicladora emita o CDF. Apenas com o cruzamento da NF-e com o CDF é possível gerar um crédito de reciclagem. <mark>(*Estudar como é feito esse 'link' entre NF-e e CDF. Existe alguma numeração que identifica um ao outro?*)</mark>
3. Enviar a junção NF-e + CDF para um verificador de resultados. Ele fará a análise e mostrará se está apto a gerar um crédito de reciclagem a partir desses documentos.
4. Tendo os documentos validados pelo verificador de resultados, o crédito fica disponível na plataforma para que empresas e entidades gestoras possam acessar e solicitar a compra. O crédito fica à disposição na plataforma, sendo uma junção de muitas notas fiscais que compõem um crédito completo.
5. Efetuada a compra, é analisado o valor pago, quantidade de notas fiscais que compõem o crédito e a pesagem de cada uma. O valor é distribuído proporcionalmente ao peso de cada nota que compõe o crédito. <mark>(*É necessário ter o rastreio da nota fiscal atrelada ao CNPJ gerador durante todo o fluxo*)</mark>

## Diagramas

### Diagrama de Processos

![Diagrama de Processos](/img/diagrama-de-processo.png)

### Diagrama de Sequencia

![Diagrama de Sequencia](/img/diagrama-de-sequencia.png)


## Tipos de Arquiteturas

Nesse sistema estuda-se utilizar um [monolito modular](../../../Arquiteturas/monolito-modular.md) adaptado para funcionar como uma [arquitetura hexagonal](../../../Arquiteturas/arquitetura-hexagonal.md).

- Exemplo para o sistema:
  - Módulo de origem (cooperativa): cuida exclusivamente do cadastro de catadores/cooperativas e do recebimento do upload dos XML/NF-e e <Definicao texto={defMTR}>MTR</Definicao>
  - Módulo de integração (auditoria/governo): atua como a camada "anticorrupção". Tem como única responsabilidade conversar com APIs do governo para ler os documentos e enviar para o <Definicao texto={defVerificador}>verificador de resultados</Definicao>.
  - Módulo de comercialização (marketplace/empresa): Onde o lote validado vira um <Definicao texto={defCCRLR}>CCRLR</Definicao>. Gerencia o saldo de crédito.
  - Módulo financeiro (PSA): Cuida do split de pagamentos, garantindo que o dinheiro pago pela indústria vá integralmente para a cooperativa.

- A arquitetura de monolito modular + arquitetura hexagonal
  - Seguir com conceito de ["monolith first"](https://martinfowler.com/bliki/MonolithFirst.html) com objetivo de iniciar o projeto enxuto, porém organizado; além disso, o objetivo é repassar custos operacionais para empresas. Para competir com players do mercado, é preciso baixar o custo de operação.
  - O monolito modular dita se as partes do sistema devem ser independentes. No entanto, para evitar que seja escrita a mesma regra básica em cada módulo isolado, usamos o Shared Kernel.

   

## Referências

- [Política Nacional de Resíduos Sólidos (PNRS)](https://www.planalto.gov.br/ccivil_03/_ato2007-2010/2010/lei/l12305.htm)
- [Decreto Federal Nº 11.413/2023](https://www.planalto.gov.br/ccivil_03/_ato2023-2026/2023/Decreto/D11413.htm)
