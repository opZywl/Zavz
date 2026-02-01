use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone, Copy)]
#[serde(rename_all = "snake_case")]
pub enum InjectionMethod {
    Standard,
    ManualMap,
    ThreadHijack,
    Reflective,
}
