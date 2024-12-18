import re
from collections import OrderedDict

def parse_css_rules(css_content):
    """
    Разбирает CSS контент на отдельные правила.
    Возвращает список кортежей (селектор, свойства).
    """
    # Удаляем комментарии
    css_content = re.sub(r'/\*[\s\S]*?\*/', '', css_content)
    
    # Разбиваем на правила
    rules = []
    current_selector = ''
    current_properties = []
    
    # Флаги для отслеживания состояния парсинга
    in_rule = False
    in_property = False
    
    for line in css_content.split('\n'):
        line = line.strip()
        if not line:
            continue
            
        # Если строка содержит открывающую скобку, это начало правила
        if '{' in line:
            current_selector = line.split('{')[0].strip()
            in_rule = True
            current_properties = []
            if '}' in line:  # Однострочное правило
                props = line.split('{')[1].split('}')[0].strip()
                current_properties.extend([p.strip() for p in props.split(';') if p.strip()])
                rules.append((current_selector, current_properties))
                in_rule = False
                
        # Если мы внутри правила
        elif in_rule:
            if '}' in line:  # Конец правила
                props = line.split('}')[0].strip()
                current_properties.extend([p.strip() for p in props.split(';') if p.strip()])
                rules.append((current_selector, current_properties))
                in_rule = False
            else:  # Продолжение свойств
                current_properties.extend([p.strip() for p in line.split(';') if p.strip()])
                
    return rules

def normalize_properties(properties):
    """
    Нормализует список свойств: сортирует и удаляет дубликаты.
    """
    # Создаем OrderedDict для сохранения последнего значения каждого свойства
    property_dict = OrderedDict()
    
    for prop in properties:
        if ':' in prop:
            key, value = [x.strip() for x in prop.split(':', 1)]
            property_dict[key] = value
            
    # Преобразуем обратно в список свойств
    return [f"{k}: {v}" for k, v in property_dict.items()]

def remove_duplicates(css_file_path, output_file_path=None):
    """
    Удаляет дублированные CSS правила из файла.
    
    Args:
        css_file_path (str): Путь к входному CSS файлу
        output_file_path (str): Путь к выходному CSS файлу (опционально)
    """
    if output_file_path is None:
        output_file_path = css_file_path.replace('.css', '_dedup.css')
    
    # Читаем CSS файл
    with open(css_file_path, 'r', encoding='utf-8') as f:
        css_content = f.read()
    
    # Парсим правила
    rules = parse_css_rules(css_content)
    
    # Создаем словарь для хранения уникальных правил
    unique_rules = OrderedDict()
    
    # Обрабатываем каждое правило
    for selector, properties in rules:
        # Нормализуем свойства
        normalized_props = normalize_properties(properties)
        
        # Если селектор уже существует, объединяем свойства
        if selector in unique_rules:
            existing_props = unique_rules[selector]
            combined_props = list(OrderedDict.fromkeys(existing_props + normalized_props))
            unique_rules[selector] = combined_props
        else:
            unique_rules[selector] = normalized_props
    
    # Формируем новый CSS контент
    output_content = []
    for selector, properties in unique_rules.items():
        output_content.append(f"{selector} {{")
        for prop in properties:
            output_content.append(f"    {prop};")
        output_content.append("}")
        output_content.append("")  # Пустая строка между правилами
    
    # Записываем результат
    with open(output_file_path, 'w', encoding='utf-8') as f:
        f.write('\n'.join(output_content))
    
    return output_file_path

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) < 2:
        print("Использование: python css_deduplicator.py input.css [output.css]")
        sys.exit(1)
    
    input_file = sys.argv[1]
    output_file = sys.argv[2] if len(sys.argv) > 2 else None
    
    try:
        output_path = remove_duplicates(input_file, output_file)
        print(f"CSS файл успешно обработан. Результат сохранен в: {output_path}")
    except Exception as e:
        print(f"Произошла ошибка: {str(e)}")
        sys.exit(1)