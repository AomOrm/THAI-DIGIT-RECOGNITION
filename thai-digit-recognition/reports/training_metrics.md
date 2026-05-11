# Thai Digit Recognition Training Metrics

![Thai Digit Recognition Metrics](training_metrics.png)

Date: 2026-05-11

## Dataset

| Class | Samples |
| --- | ---: |
| ๑๖ | 100 |
| ๑๗ | 100 |
| ๑๘ | 100 |
| ๑๙ | 100 |
| ๒๐ | 100 |
| **Total** | **500** |

## Training Setup

| Setting | Value |
| --- | --- |
| Script | `scripts/train_model.py` |
| Input directory | `data/samples/` |
| Test split | 25% |
| Test samples | 125 |
| Train samples before augmentation | 375 |
| Augmentation | Enabled: 1px shifts in 6 directions |
| Train samples after augmentation | 2625 |
| Split strategy | Stratified, `random_state=42` |
| Active model selected by | Highest validation accuracy |

## Model Summary

| Rank | Model | Accuracy | Artifact |
| ---: | --- | ---: | --- |
| 1 | SVM | 0.9200 | `models/thai_digit_svm.joblib` |
| 2 | KNN | 0.9120 | `models/thai_digit_knn.joblib` |
| 3 | Random Forest | 0.8880 | `models/thai_digit_random_forest.joblib` |
| 4 | MLP | 0.8640 | `models/thai_digit_mlp.joblib` |
| 5 | Logistic Regression | 0.8480 | `models/thai_digit_logistic_regression.joblib` |

Active model: `models/thai_digit_svm.joblib`

## Detailed Metrics

### SVM

| Class | Precision | Recall | F1-score | Support |
| --- | ---: | ---: | ---: | ---: |
| ๑๖ | 0.93 | 1.00 | 0.96 | 25 |
| ๑๗ | 0.91 | 0.80 | 0.85 | 25 |
| ๑๘ | 0.88 | 0.92 | 0.90 | 25 |
| ๑๙ | 0.88 | 0.92 | 0.90 | 25 |
| ๒๐ | 1.00 | 0.96 | 0.98 | 25 |
| **Accuracy** |  |  | **0.92** | **125** |
| **Macro avg** | **0.92** | **0.92** | **0.92** | **125** |
| **Weighted avg** | **0.92** | **0.92** | **0.92** | **125** |

### KNN

| Class | Precision | Recall | F1-score | Support |
| --- | ---: | ---: | ---: | ---: |
| ๑๖ | 1.00 | 1.00 | 1.00 | 25 |
| ๑๗ | 0.88 | 0.88 | 0.88 | 25 |
| ๑๘ | 0.84 | 0.84 | 0.84 | 25 |
| ๑๙ | 0.85 | 0.88 | 0.86 | 25 |
| ๒๐ | 1.00 | 0.96 | 0.98 | 25 |
| **Accuracy** |  |  | **0.91** | **125** |
| **Macro avg** | **0.91** | **0.91** | **0.91** | **125** |
| **Weighted avg** | **0.91** | **0.91** | **0.91** | **125** |

### Random Forest

| Class | Precision | Recall | F1-score | Support |
| --- | ---: | ---: | ---: | ---: |
| ๑๖ | 0.89 | 1.00 | 0.94 | 25 |
| ๑๗ | 0.87 | 0.80 | 0.83 | 25 |
| ๑๘ | 0.88 | 0.88 | 0.88 | 25 |
| ๑๙ | 0.81 | 0.84 | 0.82 | 25 |
| ๒๐ | 1.00 | 0.92 | 0.96 | 25 |
| **Accuracy** |  |  | **0.89** | **125** |
| **Macro avg** | **0.89** | **0.89** | **0.89** | **125** |
| **Weighted avg** | **0.89** | **0.89** | **0.89** | **125** |

### MLP

| Class | Precision | Recall | F1-score | Support |
| --- | ---: | ---: | ---: | ---: |
| ๑๖ | 0.96 | 1.00 | 0.98 | 25 |
| ๑๗ | 0.78 | 0.84 | 0.81 | 25 |
| ๑๘ | 0.78 | 0.84 | 0.81 | 25 |
| ๑๙ | 0.83 | 0.80 | 0.82 | 25 |
| ๒๐ | 1.00 | 0.84 | 0.91 | 25 |
| **Accuracy** |  |  | **0.86** | **125** |
| **Macro avg** | **0.87** | **0.86** | **0.87** | **125** |
| **Weighted avg** | **0.87** | **0.86** | **0.87** | **125** |

### Logistic Regression

| Class | Precision | Recall | F1-score | Support |
| --- | ---: | ---: | ---: | ---: |
| ๑๖ | 0.96 | 1.00 | 0.98 | 25 |
| ๑๗ | 0.72 | 0.92 | 0.81 | 25 |
| ๑๘ | 0.79 | 0.76 | 0.78 | 25 |
| ๑๙ | 0.82 | 0.72 | 0.77 | 25 |
| ๒๐ | 1.00 | 0.84 | 0.91 | 25 |
| **Accuracy** |  |  | **0.85** | **125** |
| **Macro avg** | **0.86** | **0.85** | **0.85** | **125** |
| **Weighted avg** | **0.86** | **0.85** | **0.85** | **125** |
