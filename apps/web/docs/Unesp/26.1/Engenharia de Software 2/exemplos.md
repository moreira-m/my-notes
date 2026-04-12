# Exemplos - Java

## Abstração

* Problema: Expor a lógica procedural (como as coisas são feitas) para quem utiliza a classe, em vez de oferecer uma interface simplificada (o que é feito). No exemplo, o desenvolvedor precisa conhecer a ordem técnica de operação do motor para realizar uma tarefa simples.

```java
public class MaquinaCafe {
    public void aquecerResistencia() { /* ... */ }
    public void abrirValvulaAgua() { /* ... */ }
    public void moerGraosPor10Segundos() { /* ... */ }
    public void pressurizarSistema() { /* ... */ }
}

// Uso: o Cliente precisa chamar 4 métodos na ordem correta
```

* A complexidade é ocultada por trás de um método que representa o conceito de negócio. 

```java
public class MaquinaCafe {
    public void prepararExpresso() {
        aquecerResistencia();
        moerGraos();
        passarAguaPressurizada();
    }

    private void aquecerResistencia() { /* Detalhe oculto */ }
    private void moerGraos() { /* Detalhe oculto */ }
    private void passarAguaPressurizada() { /* Detalhe oculto */ }
}

// Uso: máquina.prepararExpresso();
```

## Encapsulamento

* Problema: Permitir que o estado interno do objeto seja modificado livremente, violando regras de negócio e a integridade dos dados.

```java
public class Funcionario {
    public String nome;
    public double salario; // Public permite valores negativos ou absurdos
}

// Uso: f.salario = -5000.00; (O sistema aceita um erro grave)
```

* Utilizamos modificadores de acesso e métodos que validam a operação.

```java
public class Funcionario {
    private String nome;
    private double salario;

    public void reajustarSalario(double percentual) {
        if (percentual > 0 && percentual <= 0.5) { // Regra de aumento máximo de 50%
            this.salario += this.salario * percentual;
        } else {
            throw new IllegalArgumentException("Percentual de reajuste inválido.");
        }
    }

    public double getSalario() { return salario; }
}
```
---
## Coesão

* Problema: Uma classe que tenta ser "canivete suíço".

```java
public class ProcessadorPedido {
    public void processar(Pedido pedido) {
        // Lógica de negócio
        double total = pedido.getItens().stream().mapToDouble(i -> i.getPreco()).sum();

        // Lógica de Persistência (SQL misturado com negócio)
        String sql = "INSERT INTO pedidos VALUES (...)";

        // Lógica de Notificação
        System.out.println("Enviando e-mail para o cliente...");
    }
}
```

* Dividimos o problema em classes menores, onde cada uma tem uma única razão para mudar.


```java
public class CalculadoraPedido {
    public double calcularTotal(Pedido p) { /* Lógica apenas de cálculo */ }
}

public class PedidoRepository {
    public void salvar(Pedido p) { /* Lógica de persistência */ }
}

public class ServicoNotificacao {
    public void enviarConfirmacao(Pedido p) { /* Lógica de notificação */ }
}
```
---
## Acoplamento

* Problema: Depender de implementações concretas e rígidas, dificultando a substituição de tecnologias ou componentes.

```java
public class ServicoEnvio {
    // Acoplamento forte com uma implementação específica de SMS
    private TwilioSMSClient clienteSMS = new TwilioSMSClient();

    public void enviarAlerta(String msg) {
        clienteSMS.send(msg);
    }
}
```

* Dependemos de uma interface (abstração), permitindo trocar o fornecedor de SMS sem alterar o serviço de envio.

```java
public interface IMensageiro {
    void enviar(String mensagem);
}

public class ServicoEnvio {
    private IMensageiro mensageiro;

    // O serviço recebe qualquer classe que implemente a interface
    public ServicoEnvio(IMensageiro mensageiro) {
        this.mensageiro = mensageiro;
    }

    public void enviarAlerta(String msg) {
        mensageiro.enviar(msg);
    }
}
```
---
## Arquitetura MVC

* Problema: Misturar a interface gráfica ou tratamento de requisições diretamente com o processamento de dados.

```java
public class UsuarioView {
    public void salvarUsuario() {
        String nome = campoTexto.getText();
        // Erro: A View está acessando o Banco de Dados e fazendo lógica
        if (!nome.isEmpty()) {
            db.execute("INSERT INTO usuarios...");
            labelStatus.setText("Sucesso!");
        }
    }
}
```

```java
// MODEL: Apenas dados e regras
public class UsuarioModel {
    public void salvar(String nome) { /* Persistência */ }
}

// VIEW: Apenas interface
public class UsuarioView {
    public void atualizarStatus(String msg) { labelStatus.setText(msg); }
}

// CONTROLLER: Coordena a interação
public class UsuarioController {
    private UsuarioModel model;
    private UsuarioView view;

    public void aoClicarBotaoSalvar(String nome) {
        model.salvar(nome);
        view.atualizarStatus("Usuário salvo com sucesso!");
    }
}
```
---
## Arquitetura Orientada a Mensagens (Pub/Sub)

* Problema: O sistema emissor precisa "conhecer" todos os interessados em um evento, criando uma lista de chamadas manuais e síncronas.

```java
public class SensorFumaca {
    private Alarme alarme;
    private AspersorAgua aspersor;

    public void detectarFumaca() {
        alarme.tocar();
        aspersor.ativar();
        // Se quisermos chamar os Bombeiros, precisamos alterar esta classe.
    }
}
```

* O sensor apenas publica o evento. Quem tiver interesse (assinantes) reage por conta própria.

```java
public interface IInteressadoFumaca {
    void reagir();
}

public class SensorFumaca {
    private List<IInteressadoFumaca> assinantes = new ArrayList<>();

    public void adicionarAssinante(IInteressadoFumaca a) { assinantes.add(a); }

    public void detectarFumaca() {
        System.out.println("Fumaça detectada! Notificando todos...");
        for (IInteressadoFumaca a : assinantes) {
            a.reagir();
        }
    }
}
```

### Resumo

* Código Ruim: Geralmente com muitos *if/else*, instanciações diretas de classes (*new*) e métodos que fazem muitas coisas.
* Código Bom: Usa interfaces, métodos *private* para detalhes internos e delega tarefas para outras classes especializadas.
