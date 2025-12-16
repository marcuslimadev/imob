# Migração de DNS para Route 53 - lojadaesquina.store

**Data:** 16/12/2025  
**Status:** ✅ Route 53 configurado | ⏳ Aguardando alteração nameservers no Hostinger

---

## 📋 O que foi feito

### 1. Hosted Zone criada no Route 53
- **Zone ID:** Z079484815VIJ3WW0974S
- **Domínio:** lojadaesquina.store

### 2. Registros DNS criados no Route 53

| Tipo | Nome | Valor | Descrição |
|------|------|-------|-----------|
| **A (ALIAS)** | @ | d249h3e1di1l6l.cloudfront.net | Domínio raiz → CloudFront |
| **CNAME** | www | d249h3e1di1l6l.cloudfront.net | Subdomínio www → CloudFront |
| **MX** | @ | mx1.hostinger.com (5) | Email Hostinger |
| **MX** | @ | mx2.hostinger.com (10) | Email Hostinger backup |
| **TXT** | @ | v=spf1 include:_spf.mail.hostinger.com ~all | SPF email |

---

## ⚠️ AÇÃO NECESSÁRIA NO HOSTINGER

**Vejo na imagem que os nameservers atuais são:**
- `ns-1271.awsdns-30.org` ✅ (já está correto!)
- `ns-1624.awsdns-11.co.uk` ✅ (já está correto!)
- `ns1.dns-parking.com` ❌ (remover)
- `ns2.dns-parking.com` ❌ (remover)

### Passo a passo:

1. **Clique em "Change Nameservers"**

2. **Substitua todos os nameservers por:**
   ```
   ns-852.awsdns-42.net
   ns-56.awsdns-07.com
   ns-1271.awsdns-30.org
   ns-1624.awsdns-11.co.uk
   ```

3. **Remova os nameservers antigos:**
   - ❌ ns1.dns-parking.com
   - ❌ ns2.dns-parking.com

4. **Salve as alterações**

---

## ⏱️ Propagação DNS

- **Tempo:** 24-48 horas (geralmente 2-6 horas)
- **Durante a propagação:** Pode haver intermitência
- **Após propagação:** Tudo funcionará via Route 53

---

## ✅ Vantagens da migração

| Antes (Hostinger) | Depois (Route 53) |
|-------------------|-------------------|
| ❌ CNAME no @ não permitido | ✅ ALIAS no @ permitido |
| ❌ IP fixo necessário | ✅ Aponta direto pro CloudFront |
| ❌ Sem health checks | ✅ Health checks automáticos |
| ❌ Gestão separada | ✅ Tudo na AWS |
| ⚠️ TTL alto (14400s) | ✅ TTL flexível (300s) |

---

## 🧪 Como testar após propagação

```powershell
# Verificar nameservers
nslookup -type=NS lojadaesquina.store

# Verificar domínio raiz
nslookup lojadaesquina.store

# Verificar www
nslookup www.lojadaesquina.store
```

**Resultado esperado:**
- Nameservers: `ns-852.awsdns-42.net` e outros da AWS
- Domínio raiz: IPs do CloudFront (52.85.78.*)
- www: CNAME para CloudFront

---

## 🌐 Acesso aos sites

Após propagação, ambos funcionarão via CloudFront:
- https://lojadaesquina.store
- https://www.lojadaesquina.store

---

## 📊 Gerenciamento Route 53

**Console AWS:**
- https://console.aws.amazon.com/route53
- Hosted zones → lojadaesquina.store

**Via AWS CLI:**
```powershell
# Listar registros
aws route53 list-resource-record-sets --hosted-zone-id Z079484815VIJ3WW0974S

# Status da zona
aws route53 get-hosted-zone --id Z079484815VIJ3WW0974S
```

---

## 💰 Custos

- **Hosted Zone:** $0.50/mês
- **Queries DNS:** $0.40 por milhão (primeiros 1B grátis)
- **Total estimado:** ~$0.50-1.00/mês

---

## 🔄 Rollback (se necessário)

Se algo der errado, volte os nameservers no Hostinger para:
```
ns1.dns-parking.com
ns2.dns-parking.com
```

E delete a hosted zone no Route 53:
```powershell
aws route53 delete-hosted-zone --id Z079484815VIJ3WW0974S
```

---

## 📝 Arquivos gerados

- `temp-hosted-zone.txt` - Detalhes da hosted zone criada
- `route53-records.json` - Registros DNS configurados
- `temp-records-created.txt` - Confirmação de criação
