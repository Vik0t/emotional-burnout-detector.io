import pandas as pd
import numpy as np

xlsx_path = "Данные для хакатона.xlsx"
xls = pd.ExcelFile(xlsx_path)
df = xls.parse(xls.sheet_names[0])

kpi_block = df.iloc[:, 8:13]

header_row = kpi_block.iloc[0]
assert list(header_row.values) == ["июнь", "июль", "август", "сентябрь", "октябрь"]

month_names = ["june", "july", "august", "september", "october"]
data = {}

for col_idx, mname in enumerate(month_names):
    s = kpi_block.iloc[1:, col_idx]
    s_num = pd.to_numeric(s.replace("нет", np.nan), errors="coerce")
    mle_mean = s_num.mean()
    s_filled = s_num.fillna(mle_mean)
    data[f"kpi_{mname}"] = s_filled.astype(float)

kpi_df = pd.DataFrame(data)
kpi_df.to_csv("kpi.csv", index=False, encoding="utf-8")

print("kpi.csv создан:")
print(kpi_df.head())
print(kpi_df.describe())