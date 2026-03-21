import Definicao from '@site/src/components/Definicao';
import { defMTR, defVerificador } from './_termos.mdx';

# Sistema Pool de Crédito de Reciclagem

## Introdução

Cooperativas de triagem, em sua grande maioria, são entidades muito pobres que vivem unicamente da venda dos materiais reciclados. Atualmente existem também sistemas de compensação do lixo sólido descartado através do crédito de reciclagem, onde empresas geradoras de resíduos sólidos precisam reciclar 30% do lixo produzido.

Entidades gestoras fazem a auditoria das notas fiscais geradas pelas cooperativas e transformam em créditos de reciclagem válidos. Acontece que o processo manual e demorado faz com que entidades gestoras priorizem cooperativas que reciclam grandes quantidades, já que precisam garantir a venda dos créditos para grandes players, deixando cooperativas menores fora desse sistema.

Solução: desenvolvimento de um pool de créditos no qual as cooperativas fazem o envio das notas fiscais no sistema que audita automaticamente. A partir de agora as entidades gestoras não precisam do processo complexo, elas coletam NFs já auditadas e transformadas em créditos. Quando uma empresa faz a compra, ela "coleta" diversas notas fiscais juntas para suprir sua necessidade e nesse meio estão NFs de cooperativas menores. Em teoria faz a junção de várias notas menores em um grande certificado de crédito.
- Obs: Por mais que as grandes cooperativas tenham maior parte do lixo reciclável, esse sistema beneficia também pequenas cooperativas de acordo com seu volume de lixo reciclado, que já pode ser incluso como uma renda extra (mesmo processo de produção porém com renda de créditos)


## Tipos de Arquiteturas

Nesse sistema estuda-se em utilizar um [monolito modular](../../../Arquiteturas/monolito-modular.md) adaptado para funcionar como uma [arquitetura hexagonal](../../../Arquiteturas/arquitetura-hexagonal.md).

- Exemplo para o sistema:
  - Módulo de origem (cooperativa): cuida exclusivamente do cadastro de catadores/cooperativas e do recebimento do upload dos XML/NF-e e <Definicao texto={defMTR}>MTR</Definicao>
  - Módulo de integração (auditoria/governo): atua como a camada "anticorrupção". Tem como única responsabilidade conversar com APIs do governo para ler os documentos e enviar para o <Definicao texto={defVerificador}>verificador de resultados</Definicao>.
  - Módulo de comercialização (marketplace/empresa): Onde o lote validado vira um <Definicao texto={defCCRLR}>CCRLR</Definicao>. Gerencia o saldo de crédito.
  - Módulo financeiro (PSA): Cuida do split de pagamentos, garantindo que o dinheiro pago pela indústria vá integralmente para a cooperativa.

## Referências

- [Política Nacional de Resíduos Sólidos (PNRS)](https://www.planalto.gov.br/ccivil_03/_ato2007-2010/2010/lei/l12305.htm)
- [Decreto Federal Nº 11.413/2023](https://www.planalto.gov.br/ccivil_03/_ato2023-2026/2023/Decreto/D11413.htm)
