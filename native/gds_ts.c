/* 原生 shim：把 libtree-sitter 的解析结果拍平成定长记录（前序 + depth + UTF-8 字节区间 + 名字池）交回 TS。
 * 对外只给「整数 + 两块字节」：FFI 边界上没有 pointer 这一类，所以 parser、tree 与两块缓冲都留在 C 侧。
 * 编译必须用 zig cc -target x86_64-windows-gnu：换工具链目标会在链接期找不到 libuuid.a。 */
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#include "tree_sitter/api.h"

const TSLanguage *tree_sitter_gdscript(void);

#define GDS_REC 7
#define GDS_MAX_NODES (1 << 20)
#define GDS_MAX_NAMES (1 << 21)

static TSParser *g_parser = NULL;
static TSTree *g_tree = NULL;
static int g_nodes[GDS_MAX_NODES * GDS_REC];
static int g_node_count = 0;
static char g_names[GDS_MAX_NAMES];
static int g_names_len = 0;

static int pool_name(const char *name) {
  if (name == NULL) return 0; /* 池首是空串：那一格为 0 就是「没有字段名」 */
  int n = (int)strlen(name) + 1;
  if (g_names_len + n >= GDS_MAX_NAMES) return 0;
  int at = g_names_len;
  memcpy(g_names + at, name, (size_t)n);
  g_names_len += n;
  return at;
}

static void walk_all(TSNode node, int depth, const char *field) {
  if ((g_node_count + 1) * GDS_REC > GDS_MAX_NODES * GDS_REC) return;
  int i = g_node_count * GDS_REC;
  g_nodes[i + 0] = depth;
  g_nodes[i + 1] = pool_name(ts_node_type(node));
  g_nodes[i + 2] = (int)ts_node_start_byte(node);
  g_nodes[i + 3] = (int)ts_node_end_byte(node);
  g_nodes[i + 4] = ts_node_is_named(node) ? 1 : 0;
  g_nodes[i + 5] = ts_node_has_error(node) ? 1 : 0;
  g_nodes[i + 6] = pool_name(field);
  g_node_count++;
  uint32_t n = ts_node_child_count(node);
  for (uint32_t c = 0; c < n; c++) walk_all(ts_node_child(node, c), depth + 1, ts_node_field_name_for_child(node, c));
}

int gds_init(void) {
  if (g_parser == NULL) g_parser = ts_parser_new();
  return ts_parser_set_language(g_parser, tree_sitter_gdscript()) ? 1 : 0;
}

/* 长度不照 TS 传的走：JS 的 .length 是 UTF-16 码元数，这里要的是 UTF-8 字节数；源码没有内嵌 NUL，所以 strlen 是安全的。 */
int gds_parse_nodes(const char *src, int len) {
  (void)len;
  if (g_parser == NULL) return -1;
  if (g_tree != NULL) {
    ts_tree_delete(g_tree);
    g_tree = NULL;
  }
  g_node_count = 0;
  g_names[0] = '\0';
  g_names_len = 1;
  g_tree = ts_parser_parse_string(g_parser, NULL, src, (uint32_t)strlen(src));
  if (g_tree == NULL) return 0;
  walk_all(ts_tree_root_node(g_tree), 0, NULL);
  return g_node_count;
}

int gds_nodes_bytes(void) { return g_node_count * GDS_REC * 4; }

int gds_nodes_into(unsigned char *buf, int cap) {
  int bytes = g_node_count * GDS_REC * 4;
  int n = bytes < cap ? bytes : cap;
  if (n > 0) memcpy(buf, g_nodes, (size_t)n);
  return n;
}

int gds_names_bytes(void) { return g_names_len; }

int gds_names_into(unsigned char *buf, int cap) {
  int n = g_names_len < cap ? g_names_len : cap;
  if (n > 0) memcpy(buf, g_names, (size_t)n);
  return n;
}
