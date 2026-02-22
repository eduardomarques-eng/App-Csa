import numpy as np

def calcular_vento(v0, s1, s2, s3, cp):
    """
    Calcula parâmetros de vento conforme NBR 6123:2023.
    
    Args:
        v0 (float): Velocidade básica do vento (m/s)
        s1 (float): Fator topográfico
        s2 (float): Fator de rugosidade/dimensões
        s3 (float): Fator estatístico
        cp (float): Coeficiente de pressão
        
    Returns:
        dict: Vk (m/s), q (N/m2), Pe (N/m2), Ps (N/m2)
    """
    vk = v0 * s1 * s2 * s3
    q = 0.613 * (vk ** 2)
    pe = q * cp
    ps = q * (cp - 0.2) # Simplificação para pressão interna
    
    return {
        "vk": vk,
        "q": q,
        "pe": pe,
        "ps": ps
    }

def calcular_vidro(area_m2, pressao_Pa, apoios_lados=4, relacao_L_div_l=1.0, inclinacao_graus=90, duracao_carga_segundos=3):
    """
    Calcula espessura e tensões no vidro conforme NBR 7199:2025.
    
    Args:
        area_m2 (float): Área da chapa de vidro
        pressao_Pa (float): Pressão de projeto em Pascal
        apoios_lados (int): Número de lados apoiados (2 ou 4)
        relacao_L_div_l (float): Razão entre lado maior e lado menor
        inclinacao_graus (float): Inclinação em relação à horizontal
        duracao_carga_segundos (int): Duração da carga
        
    Returns:
        dict: e1 (mm), tensao_MPa, alpha_usado
    """
    # Tabela de referência aproximada para alpha (NBR 7199)
    # Relação L/l vs Alpha (para 4 apoios)
    tabela_alpha = {
        1.0: 0.284,
        1.2: 0.372,
        1.4: 0.455,
        1.6: 0.530,
        1.8: 0.598,
        2.0: 0.658,
        2.5: 0.778,
        3.0: 0.864,
        4.0: 0.960,
        5.0: 1.000
    }
    
    x = np.array(list(tabela_alpha.keys()))
    y = np.array(list(tabela_alpha.values()))
    
    alpha = np.interp(relacao_L_div_l, x, y)
    
    # Espessura teórica e1 = sqrt(alpha * p * a^2 / sigma_adm)
    # Simplificação para o exemplo:
    lado_menor = np.sqrt(area_m2 / relacao_L_div_l)
    tensao = (alpha * pressao_Pa * (lado_menor**2)) / (10**6) # MPa (exemplo simplificado)
    
    return {
        "alpha": alpha,
        "tensao_MPa": tensao,
        "e_teorica": np.sqrt(tensao * 10) # Exemplo de dimensionamento
    }

def calcular_perfil(momento_Nm, cortante_N, ix_cm4, wx_cm3, l_cm, e_gpa=70, condicao_contorno="bi-apoiado"):
    """
    Calcula tensões e flechas em perfis de alumínio.
    """
    e_pa = e_gpa * 10**9
    ix_m4 = ix_cm4 * 10**-8
    wx_m3 = wx_cm3 * 10**-6
    l_m = l_cm / 100
    
    sigma = momento_Nm / wx_m3 / 10**6 # MPa
    
    # Flecha simplificada para carga distribuída (q = 8M/L^2)
    q = (8 * momento_Nm) / (l_m**2)
    flecha = (5 * q * l_m**4) / (384 * e_pa * ix_m4) * 1000 # mm
    
    return {
        "sigma_MPa": sigma,
        "flecha_mm": flecha,
        "fs_elu": 150 / sigma if sigma > 0 else 999 # Exemplo FS
    }

def verificar_elu_els(sigma, flecha, fs_min=1.5, tipo_elemento="montante"):
    """
    Verifica status ELU e ELS.
    """
    status_elu = sigma < 80 # Exemplo limite 80MPa
    status_els = flecha < 15 # Exemplo limite 15mm
    
    return {
        "elu": "OK" if status_elu else "FALHA",
        "els": "OK" if status_els else "FALHA",
        "mensagens": ["Tensão dentro do limite" if status_elu else "Tensão excessiva"]
    }

if __name__ == "__main__":
    # Exemplo de uso
    vento = calcular_vento(45, 1.0, 0.9, 1.0, -0.8)
    print(f"Vento: {vento}")
    
    vidro = calcular_vidro(1.2 * 3.0, vento['pe'], relacao_L_div_l=3.0/1.2)
    print(f"Vidro: {vidro}")
    
    perfil = calcular_perfil(1200, 500, 150, 30, 300)
    print(f"Perfil: {perfil}")
