import Definicao from '@site/src/components/Definicao';
import { defMTR, defVerificador, defCCRLR } from './_termos.mdx';

# Sistema Pool de Crédito de Reciclagem

## Introdução

Cooperativas de triagem, em sua grande maioria, são entidades muito pobres que vivem unicamente da venda dos materiais reciclados. Atualmente existem também sistemas de compensação do lixo sólido descartado através do crédito de reciclagem, onde empresas geradoras de resíduos sólidos precisam reciclar 30% do lixo produzido.

Entidades gestoras fazem a auditoria das notas fiscais geradas pelas cooperativas e transformam em créditos de reciclagem válidos. Acontece que o processo manual e demorado faz com que entidades gestoras priorizem cooperativas que reciclam grandes quantidades, já que precisam garantir a venda dos créditos para grandes players, deixando cooperativas menores fora desse sistema.

Solução: desenvolvimento de um pool de créditos no qual as cooperativas fazem o envio das notas fiscais no sistema que audita automaticamente. A partir de agora as entidades gestoras não precisam do processo complexo, elas coletam NFs já auditadas e transformadas em créditos. Quando uma empresa faz a compra, ela "coleta" diversas notas fiscais juntas para suprir sua necessidade e nesse meio estão NFs de cooperativas menores. Em teoria faz a junção de várias notas menores em um grande certificado de crédito.
- Obs: Por mais que as grandes cooperativas tenham maior parte do lixo reciclável, esse sistema beneficia também pequenas cooperativas de acordo com seu volume de lixo reciclado, que já pode ser incluso como uma renda extra (mesmo processo de produção porém com renda de créditos)



## Objetivo Principal

O objetivo principal do sistema é inserir outra forma de renda para a base da cadeia (cooperativas e catadores).


## Fluxos do Sistema

1. Cooperativa acessa a plataforma para fazer o upload de um XML da nota fiscal do lixo que foi triado e vendido. Nessa etapa vai ser preciso captar algumas informaçoes importantes como:
   - CNPJ da cooperativa
   - Número da Nota Fiscal
   - Tipo de Material
   - Pesagem do Material
2. A Nota Fiscal enviada pela cooperativa é armazenada no sistema e persiste com status de espera até que a indústria recicladora emita o CDF. Apenas com o cruzamento da NF-e com o CDF é possivel gerar um crédito de reciclagem. <mark>(*Estudar como é feito esse 'link' entre NF-e e CDF. Existe alguma numeraçao que identificam um ao outro?*)</mark>
3. Enviar a junçao NF-e + CDF para um verificador de resultados. Ele fará a análise e mostrará se está apto a gerar um crédito de reciclagem a partir desses documentos.
4. Tendo os documentos válidados pelo verificador de resultados, o crédito fica disponível na plataforma para que empresas e entidades gestoras possam acessar e solicitar a compra. O crédito fica a disposiçao na plataforma sendo uma junçao de muitas notas fiscais que compoem um crédito completo.
5. Efetuada a compra, é analisado o valor pago, quantidade de notas fiscais que compoem o crédito e a pesagem de cada uma. O valor é distribuído proporcionalmente ao peso de cada nota que compoe o crédito. <mark>(*É necessário ter o rastreio da nota fiscal atrelada ao CNPJ gerador durante todo o fluxo*)</mark>


## Tipos de Arquiteturas

Nesse sistema estuda-se em utilizar um [monolito modular](../../../Arquiteturas/monolito-modular.md) adaptado para funcionar como uma [arquitetura hexagonal](../../../Arquiteturas/arquitetura-hexagonal.md).

- Exemplo para o sistema:
  - Módulo de origem (cooperativa): cuida exclusivamente do cadastro de catadores/cooperativas e do recebimento do upload dos XML/NF-e e <Definicao texto={defMTR}>MTR</Definicao>
  - Módulo de integração (auditoria/governo): atua como a camada "anticorrupção". Tem como única responsabilidade conversar com APIs do governo para ler os documentos e enviar para o <Definicao texto={defVerificador}>verificador de resultados</Definicao>.
  - Módulo de comercialização (marketplace/empresa): Onde o lote validado vira um <Definicao texto={defCCRLR}>CCRLR</Definicao>. Gerencia o saldo de crédito.
  - Módulo financeiro (PSA): Cuida do split de pagamentos, garantindo que o dinheiro pago pela indústria vá integralmente para a cooperativa.

- A arquitetura de monolito modular + arquitetura hexagonal
  - Seguir com conceito de ["monolith first"](https://martinfowler.com/bliki/MonolithFirst.html) com objetivo de iniciar o projeto enxuto porém organizado; além disso, o objetivo é repassar custos operacionais para empresas, para competir com players do mercado é preciso baixar o custo de operaçao.
  - O monolito modular dita se as partes do sistema devem ser independetes. No entanto, para evitar que seja escrito a mesma regra básica em cada módulo isolado, usamos o Shared Kernel.

   

## Referências

- [Política Nacional de Resíduos Sólidos (PNRS)](https://www.planalto.gov.br/ccivil_03/_ato2007-2010/2010/lei/l12305.htm)
- [Decreto Federal Nº 11.413/2023](https://www.planalto.gov.br/ccivil_03/_ato2023-2026/2023/Decreto/D11413.htm)
