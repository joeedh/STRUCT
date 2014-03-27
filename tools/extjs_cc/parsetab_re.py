
# parsetab_re.py
# This file is automatically generated. Do not edit.
_tabversion = '3.2'

_lr_method = 'LALR'

_lr_signature = b'\xe3\xf7\x1b^\x13\xcdAc\xfa\xaan\xef\x88\x91db'
    
_lr_action_items = {'LSBRACKET':([2,3,4,5,6,7,9,10,11,12,13,14,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,],[3,-33,-7,-20,-6,-4,-19,16,-5,-21,24,3,-13,-14,-17,-12,-18,-16,-11,-15,-27,-31,-35,-28,-34,-30,-29,-32,-26,-10,-23,-9,-3,-22,-24,-8,-25,]),'RSBRACKET':([2,3,4,5,6,7,9,10,11,12,13,14,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,],[5,-33,-7,-20,-6,-4,-19,17,-5,-21,25,34,-13,-14,-17,-12,-18,-16,-11,-15,-27,-31,-35,-28,-34,-30,-29,-32,-26,-10,-23,-9,-3,-22,-24,-8,-25,]),'BACKSLASH':([2,3,4,5,6,7,9,10,11,12,13,14,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,],[10,-33,-7,-20,-6,-4,-19,18,-5,-21,10,10,-13,-14,-17,-12,-18,-16,-11,-15,-27,-31,-35,-28,-34,-30,-29,-32,-26,-10,-23,-9,-3,-22,-24,-8,-25,]),'UCHAR':([2,3,4,5,6,7,9,10,11,12,13,14,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,],[9,-33,-7,-20,-6,-4,-19,19,-5,-21,32,37,-13,-14,-17,-12,-18,-16,-11,-15,-27,-31,-35,-28,-34,-30,-29,-32,-26,-10,-23,-9,-3,-22,-24,-8,-25,]),'DIVIDE':([0,3,4,5,6,7,8,9,10,11,12,13,14,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,],[2,-33,-7,-20,-6,-4,15,-19,21,-5,-21,30,-2,-13,-14,-17,-12,-18,-16,-11,-15,-27,-31,-35,-28,-34,-30,-29,-32,-26,-10,-23,-9,-3,-22,-24,-8,-25,]),'STAR':([3,4,5,6,7,9,10,11,12,13,14,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,],[-33,-7,-20,-6,-4,-19,23,-5,-21,27,38,-13,-14,-17,-12,-18,-16,-11,-15,-27,-31,-35,-28,-34,-30,-29,-32,-26,-10,-23,-9,-3,-22,-24,-8,-25,]),'$end':([1,15,41,42,],[0,-37,-1,-36,]),'ID_PART':([2,3,4,5,6,7,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,],[12,-33,-7,-20,-6,-4,-19,20,-5,-21,29,40,-37,-13,-14,-17,-12,-18,-16,-11,-15,-27,-31,-35,-28,-34,-30,-29,-32,-26,-10,-23,-9,-3,-22,-24,-8,-25,42,-36,]),}

_lr_action = { }
for _k, _v in _lr_action_items.items():
   for _x,_y in zip(_v[0],_v[1]):
      if not _x in _lr_action:  _lr_action[_x] = { }
      _lr_action[_x][_k] = _y
del _lr_action_items

_lr_goto_items = {'re_expr_class':([2,14,],[4,33,]),'re_backlash_seq':([2,13,14,],[6,26,35,]),'re_char':([14,],[36,]),'re_lit':([0,],[1,]),'re_first_char':([2,],[7,]),'re_body':([2,],[8,]),'re_non_term_restrict1':([2,],[11,]),'re_flags':([15,],[41,]),'re_chars':([7,],[14,]),'re_non_term_restrict3':([13,],[28,]),'re_non_term_restrict2':([14,],[39,]),'re_class_char':([13,],[31,]),'re_non_term':([10,],[22,]),'re_class_chars':([3,],[13,]),}

_lr_goto = { }
for _k, _v in _lr_goto_items.items():
   for _x,_y in zip(_v[0],_v[1]):
       if not _x in _lr_goto: _lr_goto[_x] = { }
       _lr_goto[_x][_k] = _y
del _lr_goto_items
_lr_productions = [
  ("S' -> re_lit","S'",1,None,None,None),
  ('re_lit -> DIVIDE re_body DIVIDE re_flags','re_lit',4,'p_re_lit','/home/joeedh/drivesync/mnt/WebGL/js_parser/js_regexpr_parse.py',51),
  ('re_body -> re_first_char re_chars','re_body',2,'p_re_body','/home/joeedh/drivesync/mnt/WebGL/js_parser/js_regexpr_parse.py',56),
  ('re_chars -> re_chars re_char','re_chars',2,'p_re_chars','/home/joeedh/drivesync/mnt/WebGL/js_parser/js_regexpr_parse.py',61),
  ('re_chars -> <empty>','re_chars',0,'p_re_chars','/home/joeedh/drivesync/mnt/WebGL/js_parser/js_regexpr_parse.py',62),
  ('re_first_char -> re_non_term_restrict1','re_first_char',1,'p_re_first_char','/home/joeedh/drivesync/mnt/WebGL/js_parser/js_regexpr_parse.py',71),
  ('re_first_char -> re_backlash_seq','re_first_char',1,'p_re_first_char','/home/joeedh/drivesync/mnt/WebGL/js_parser/js_regexpr_parse.py',72),
  ('re_first_char -> re_expr_class','re_first_char',1,'p_re_first_char','/home/joeedh/drivesync/mnt/WebGL/js_parser/js_regexpr_parse.py',73),
  ('re_char -> re_non_term_restrict2','re_char',1,'p_re_char','/home/joeedh/drivesync/mnt/WebGL/js_parser/js_regexpr_parse.py',79),
  ('re_char -> re_backlash_seq','re_char',1,'p_re_char','/home/joeedh/drivesync/mnt/WebGL/js_parser/js_regexpr_parse.py',80),
  ('re_char -> re_expr_class','re_char',1,'p_re_char','/home/joeedh/drivesync/mnt/WebGL/js_parser/js_regexpr_parse.py',81),
  ('re_backlash_seq -> BACKSLASH re_non_term','re_backlash_seq',2,'p_re_backlash_seq','/home/joeedh/drivesync/mnt/WebGL/js_parser/js_regexpr_parse.py',87),
  ('re_non_term -> UCHAR','re_non_term',1,'p_re_non_term','/home/joeedh/drivesync/mnt/WebGL/js_parser/js_regexpr_parse.py',92),
  ('re_non_term -> LSBRACKET','re_non_term',1,'p_re_non_term','/home/joeedh/drivesync/mnt/WebGL/js_parser/js_regexpr_parse.py',93),
  ('re_non_term -> RSBRACKET','re_non_term',1,'p_re_non_term','/home/joeedh/drivesync/mnt/WebGL/js_parser/js_regexpr_parse.py',94),
  ('re_non_term -> STAR','re_non_term',1,'p_re_non_term','/home/joeedh/drivesync/mnt/WebGL/js_parser/js_regexpr_parse.py',95),
  ('re_non_term -> DIVIDE','re_non_term',1,'p_re_non_term','/home/joeedh/drivesync/mnt/WebGL/js_parser/js_regexpr_parse.py',96),
  ('re_non_term -> BACKSLASH','re_non_term',1,'p_re_non_term','/home/joeedh/drivesync/mnt/WebGL/js_parser/js_regexpr_parse.py',97),
  ('re_non_term -> ID_PART','re_non_term',1,'p_re_non_term','/home/joeedh/drivesync/mnt/WebGL/js_parser/js_regexpr_parse.py',98),
  ('re_non_term_restrict1 -> UCHAR','re_non_term_restrict1',1,'p_re_non_term_restrict1','/home/joeedh/drivesync/mnt/WebGL/js_parser/js_regexpr_parse.py',103),
  ('re_non_term_restrict1 -> RSBRACKET','re_non_term_restrict1',1,'p_re_non_term_restrict1','/home/joeedh/drivesync/mnt/WebGL/js_parser/js_regexpr_parse.py',104),
  ('re_non_term_restrict1 -> ID_PART','re_non_term_restrict1',1,'p_re_non_term_restrict1','/home/joeedh/drivesync/mnt/WebGL/js_parser/js_regexpr_parse.py',105),
  ('re_non_term_restrict2 -> UCHAR','re_non_term_restrict2',1,'p_re_non_term_restrict2','/home/joeedh/drivesync/mnt/WebGL/js_parser/js_regexpr_parse.py',110),
  ('re_non_term_restrict2 -> RSBRACKET','re_non_term_restrict2',1,'p_re_non_term_restrict2','/home/joeedh/drivesync/mnt/WebGL/js_parser/js_regexpr_parse.py',111),
  ('re_non_term_restrict2 -> STAR','re_non_term_restrict2',1,'p_re_non_term_restrict2','/home/joeedh/drivesync/mnt/WebGL/js_parser/js_regexpr_parse.py',112),
  ('re_non_term_restrict2 -> ID_PART','re_non_term_restrict2',1,'p_re_non_term_restrict2','/home/joeedh/drivesync/mnt/WebGL/js_parser/js_regexpr_parse.py',113),
  ('re_non_term_restrict3 -> UCHAR','re_non_term_restrict3',1,'p_re_non_term_restrict3','/home/joeedh/drivesync/mnt/WebGL/js_parser/js_regexpr_parse.py',119),
  ('re_non_term_restrict3 -> LSBRACKET','re_non_term_restrict3',1,'p_re_non_term_restrict3','/home/joeedh/drivesync/mnt/WebGL/js_parser/js_regexpr_parse.py',120),
  ('re_non_term_restrict3 -> STAR','re_non_term_restrict3',1,'p_re_non_term_restrict3','/home/joeedh/drivesync/mnt/WebGL/js_parser/js_regexpr_parse.py',121),
  ('re_non_term_restrict3 -> DIVIDE','re_non_term_restrict3',1,'p_re_non_term_restrict3','/home/joeedh/drivesync/mnt/WebGL/js_parser/js_regexpr_parse.py',122),
  ('re_non_term_restrict3 -> ID_PART','re_non_term_restrict3',1,'p_re_non_term_restrict3','/home/joeedh/drivesync/mnt/WebGL/js_parser/js_regexpr_parse.py',123),
  ('re_expr_class -> LSBRACKET re_class_chars RSBRACKET','re_expr_class',3,'p_re_expr_class','/home/joeedh/drivesync/mnt/WebGL/js_parser/js_regexpr_parse.py',128),
  ('re_class_chars -> re_class_chars re_class_char','re_class_chars',2,'p_re_class_chars','/home/joeedh/drivesync/mnt/WebGL/js_parser/js_regexpr_parse.py',134),
  ('re_class_chars -> <empty>','re_class_chars',0,'p_re_class_chars','/home/joeedh/drivesync/mnt/WebGL/js_parser/js_regexpr_parse.py',135),
  ('re_class_char -> re_non_term_restrict3','re_class_char',1,'p_re_class_char','/home/joeedh/drivesync/mnt/WebGL/js_parser/js_regexpr_parse.py',144),
  ('re_class_char -> re_backlash_seq','re_class_char',1,'p_re_class_char','/home/joeedh/drivesync/mnt/WebGL/js_parser/js_regexpr_parse.py',145),
  ('re_flags -> re_flags ID_PART','re_flags',2,'p_re_flags','/home/joeedh/drivesync/mnt/WebGL/js_parser/js_regexpr_parse.py',151),
  ('re_flags -> <empty>','re_flags',0,'p_re_flags','/home/joeedh/drivesync/mnt/WebGL/js_parser/js_regexpr_parse.py',152),
]
