import csv

total_debits = 0
total_credits = 0
total_solde = 0

with open('sample-balance-real-data.csv', 'r') as f:
    reader = csv.DictReader(f)
    for row in reader:
        debits = float(row['debits'])
        credits = float(row['credits'])
        solde = float(row['solde'])
        
        total_debits += debits
        total_credits += credits
        total_solde += solde

print(f'Total Débits: {total_debits:,.2f}')
print(f'Total Crédits: {total_credits:,.2f}')
print(f'Différence: {total_debits - total_credits:,.2f}')
print(f'Somme des soldes: {total_solde:,.2f}')
print(f'Équilibré: {"Oui" if abs(total_debits - total_credits) < 0.01 else "Non"}') 