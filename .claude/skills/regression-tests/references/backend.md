# Backend (Django)

## Executar

Os comandos ficam na seção "Executar os testes" do `README.md`.

## Estrutura

Cada app tem uma pasta `tests/`:

```
apps/NOME_DO_APP/tests/
├── __init__.py        # from .test_NOME import *
└── test_NOME.py
```

- Sem o `__init__.py` o Django não encontra os testes.
- Ao criar um novo arquivo de teste, adicione o import dele no `__init__.py`.
- Se existir um `tests.py` antigo ao lado da pasta `tests/`, ele deixa de ser executado. Avise o usuário em vez de apagá-lo.

Use `templates/test_example.py` como ponto de partida.

## Qual classe base usar

| Caso                                    | Classe           | Observação                                                                               |
| --------------------------------------- | ---------------- | ---------------------------------------------------------------------------------------- |
| Validadores, funções e lógica sem banco | `SimpleTestCase` | Monte os objetos com `SimpleNamespace`. Roda em milissegundos e não cria o banco.        |
| Models, constraints, signals, queries   | `TestCase`       | Cria o banco de teste no PostgreSQL. Cada teste roda em uma transação desfeita ao final. |

Para simular uma relação reversa sem banco (ex.: `category.attributes.all()`):

```python
category = SimpleNamespace(attributes=SimpleNamespace(all=lambda: [attribute]))
```

## Armadilhas conhecidas

- **Constraints:** envolva a criação em `transaction.atomic()` ao testar `IntegrityError`, senão a transação do teste fica quebrada:
    ```python
    with self.assertRaises(IntegrityError):
        with transaction.atomic():
            Model.objects.create(...)
    ```
- **Cache:** o cache é `LocMemCache` e não é limpo entre testes. Chame `cache.clear()` no `setUp` e no `tearDown` de testes que dependem dele (ex.: `Employee.get_all_permissions`).
- **`Construction`:** ao ser criada, o signal `post_save` cria uma `ConstructionPermission` para cada `construction_permissions` declarado nos models. Busque as permissões existentes em vez de criá-las.
- **Valores que mudam com o projeto:** não deixe fixas listas como a de permissões. Calcule a partir do código (ex.: percorrer `apps.get_models()`).
- **`ValidationError`:** compare `error.exception.message_dict[chave]` para erros por campo e `error.exception.messages` para erros simples.
- **Usuários:** crie com `User.objects.create_user(email=..., password=..., first_name=..., last_name=...)`.
